import { ActionHandlerService } from '@app/services/action-handler/action-handler.service';
import { ActionService } from '@app/services/action/action.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { CombatService } from '@app/services/combat/combat.service';
import { PlayerCoord } from '@common/player';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class VirtualPlayerService {
    virtualPlayerId: string;
    roomId: string;
    server: Server;

    constructor(
        @Inject(forwardRef(() => ActionHandlerService))
        private readonly actionHandler: ActionHandlerService,
        private readonly actionService: ActionService,
        private readonly activeGames: ActiveGamesService,
        private readonly combatService: CombatService,
    ) {}

    afterInit(server: Server) {
        this.server = server;
    }

    action() {
        const gameInstance = this.activeGames.activeGames.find((instance) => instance.roomId === this.roomId);
        const virtualPlayerCoord = gameInstance.playersCoord.find((playerCoord) => playerCoord.player.id === this.virtualPlayerId);
        const virtualPlayerPosition = virtualPlayerCoord.position;

        const otherPlayers = gameInstance.playersCoord.filter((playerCoord) => playerCoord.player.id !== this.virtualPlayerId);
        const otherPlayersPositions = otherPlayers.map((playerCoord) => playerCoord.position);

        // todo use actionbuttonservice get players around
        const adjacentPositions = [
            virtualPlayerPosition - 1, // left
            virtualPlayerPosition + 1, // right
            virtualPlayerPosition - parseInt(gameInstance.game.mapSize), // above
            virtualPlayerPosition + parseInt(gameInstance.game.mapSize), // below
        ];

        const isPlayerAdjacent = otherPlayersPositions.some((position) => adjacentPositions.includes(position));
        if (isPlayerAdjacent) {
            const randomPlayerCoord = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
            this.startAttack(virtualPlayerCoord, randomPlayerCoord);
        } else {
            this.move();
        }
    }

    move() {
        const availablePlayerMoves = this.actionService.availablePlayerMoves(this.virtualPlayerId, this.roomId);
        let endPosition: number;
        const accessibleTiles = Object.keys(availablePlayerMoves).map(Number);
        endPosition = accessibleTiles[Math.floor(Math.random() * accessibleTiles.length)];
        this.actionHandler.handleMove({ roomId: this.roomId, playerId: this.virtualPlayerId, endPosition }, this.server, null);
        this.actionHandler.handleEndTurn({ roomId: this.roomId, playerId: this.virtualPlayerId, lastTurn: false }, this.server);
    }

    startAttack(virtualPlayerCoord: PlayerCoord, targetPlayerCoord: PlayerCoord) {
        const [firstTurnPlayer, secondTurnPlayer] = this.combatService.startCombat(this.roomId, [virtualPlayerCoord, targetPlayerCoord]);
        this.server
            .to(this.roomId)
            .emit('startCombat', { attacker: firstTurnPlayer, defender: secondTurnPlayer, combatInitiatorId: virtualPlayerCoord.player.id });
        const [attackerDice, defenderDice, combatStatus, defender, isAttackSuccessful] = this.combatService.attack(
            this.roomId,
            virtualPlayerCoord,
            targetPlayerCoord,
            this.server,
        );

        this.server.to(this.roomId).emit('attacked', {
            attacker: firstTurnPlayer,
            attackerDice,
            defender,
            defenderDice,
            isAttackSuccessful,
        });

        const formattedTime = this.actionHandler.getCurrentTimeFormatted();
        const attackResult = isAttackSuccessful ? 'réussi' : 'échoué';
        const message = `${virtualPlayerCoord.player.name} attaque ${defender.player.name}. \n L'attaque a ${attackResult}. \n
            Jet de dé attaquant: ${attackerDice}.\n Jet de dé défenseur: ${defenderDice}\n
            calcul: ${virtualPlayerCoord.player.attributes.attack + attackerDice} vs ${defender.player.attributes.defense + defenderDice}`;
        this.server.to(this.roomId).emit('newLog', {
            date: formattedTime,
            message: message,
            sender: virtualPlayerCoord.player.id,
            receiver: defender.player.id,
            exclusive: true,
        });

        if (combatStatus === 'combatTurnEnd') {
            this.combatService.startCombatTurn(this.roomId, defender);
            this.server.to(this.roomId).emit('changeCombatTurn', defender.player.id);
        }
    }

    interactWithDoor() {}
}
