import { ActionButtonService } from '@app/services/action-button/action-button.service';
import { ActionHandlerService } from '@app/services/action-handler/action-handler.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { CombatService } from '@app/services/combat/combat.service';
import { CombatAction } from '@common/combat-actions';
import { TileTypes } from '@common/tile-types';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
@WebSocketGateway()
export class CombatGateway {
    @WebSocketServer() server: Server;

    constructor(
        private readonly activeGameService: ActiveGamesService,
        private readonly combatService: CombatService,
        private readonly actionButtonService: ActionButtonService,
        private readonly actionHandlerService: ActionHandlerService,
    ) {}

    @SubscribeMessage('startAction')
    handleStartAction(@ConnectedSocket() client, @MessageBody() data: { roomId: string; playerId: string }) {
        const player = this.activeGameService.getActiveGame(data.roomId).playersCoord.find((player) => player.player.id === data.playerId);
        client.emit('startAction', this.actionButtonService.getAvailableIndexes(data.roomId, player));
    }

    @SubscribeMessage('action')
    handleAction(@ConnectedSocket() client, @MessageBody() data: { roomId: string; playerId: string; target: number }) {
        // TODO: identify the target player in the front end to send a start action message instead of interpreting the target here (cant know if an item is targeted or a player)
        const player = this.activeGameService.getActiveGame(data.roomId).playersCoord.find((player) => player.player.id === data.playerId);
        if (this.activeGameService.getActiveGame(data.roomId).game.map[data.target].hasPlayer) {
            const targetPlayer = this.activeGameService.getActiveGame(data.roomId).playersCoord.find((player) => player.position === data.target);
            const fighters = [player, targetPlayer];
            const [firstTurnPlayer, secondTurnPlayer] = this.combatService.startCombat(data.roomId, fighters);
            this.server
                .to(data.roomId)
                .emit('startCombat', { attacker: firstTurnPlayer, defender: secondTurnPlayer, combatInitiatorId: player.player.id });
        } else if (
            this.activeGameService.getActiveGame(data.roomId).game.map[data.target].tileType === TileTypes.DOORCLOSED ||
            this.activeGameService.getActiveGame(data.roomId).game.map[data.target].tileType === TileTypes.DOOROPEN
        ) {
            const newData = { roomId: data.roomId, playerId: data.playerId, doorPosition: data.target };
            this.actionHandlerService.handleInteractDoor(newData, this.server, client);
        }
    }

    @SubscribeMessage('attack')
    handleAttack(@ConnectedSocket() client, @MessageBody() data: { roomId: string; playerId: string }) {
        if (this.combatService.getCurrentTurnPlayer(data.roomId).player.id === data.playerId) {
            console.log('getCurrentTurnPlayer');
            const player = this.activeGameService.getActiveGame(data.roomId).playersCoord.find((player) => player.player.id === data.playerId);
            const targetPlayer = this.combatService.getFighters(data.roomId).find((player) => player.player.id !== data.playerId);

            const [attackerDice, defenderDice, combatStatus, defender, isAttackSuccessful] = this.combatService.attack(
                data.roomId,
                player,
                targetPlayer,
                this.server,
            );

            this.server.to(data.roomId).emit('attacked', {
                attacker: player,
                attackerDice: attackerDice,
                defender: defender,
                defenderDice: defenderDice,
                isAttackSuccessful: isAttackSuccessful,
            });

            // if (combatStatus === 'combatEnd') {
            //     this.server.to(data.roomId).emit('endCombat', { playerId: data.playerId });
            // } else
            if (combatStatus === 'combatTurnEnd') {
                this.combatService.startCombatTurn(data.roomId, defender);
                this.server.to(data.roomId).emit('changeCombatTurn', defender.player.id);
            }
        }
    }

    // escape
    @SubscribeMessage('escape')
    handleEscape(@ConnectedSocket() client, @MessageBody() data: { roomId: string; playerId: string }) {
        const player = this.activeGameService.getActiveGame(data.roomId).playersCoord.find((player) => player.player.id === data.playerId);
        const [remainingEscapeChances, escapeResult] = this.combatService.escape(data.roomId, player, this.server);
        this.server
            .to(data.roomId)
            .emit('didEscape', { playerId: data.playerId, remainingEscapeChances: remainingEscapeChances, hasEscaped: escapeResult });

        if (escapeResult) {
            const resetFighters = this.combatService.endCombat(data.roomId);
            this.server.to(data.roomId).emit('endCombat', resetFighters);
        } else {
            const defender = this.combatService.getFighters(data.roomId).find((player) => player.player.id !== data.playerId);
            this.combatService.startCombatTurn(data.roomId, defender);
            this.server.to(data.roomId).emit('changeCombatTurn', defender.player.id);
        }
    }

    // startCombatTurn
    @SubscribeMessage('startCombatTurn')
    handleStartCombatTurn(@ConnectedSocket() client, @MessageBody() data: { roomId: string; playerId: string; combatAction: CombatAction }) {
        const player = this.activeGameService.getActiveGame(data.roomId).playersCoord.find((player) => player.player.id === data.playerId);
        this.combatService.startCombatTurn(data.roomId, player);
        this.server.to(data.roomId).emit('changeCombatTurn', { playerId: data.playerId, combatAction: data.combatAction });
    }

    // endCombat
    @SubscribeMessage('endCombat')
    handleEndCombat(@ConnectedSocket() client, @MessageBody() data: { roomId: string; playerId: string }) {
        const player = this.activeGameService.getActiveGame(data.roomId).playersCoord.find((player) => player.player.id === data.playerId);
        const fighters = this.combatService.endCombat(data.roomId, player);
        this.server.to(data.roomId).emit('endCombat', { playerId: data.playerId, attacker: fighters[0], defender: fighters[1] });
    }

    // killedPlayer + KilledPlayerHomePosition
    // @SubscribeMessage('killedPlayer')
    // handleKilledPlayer(@ConnectedSocket() client, @MessageBody() data: { roomId: string; playerId: string }) {
    //     const player = this.activeGameService.getActiveGame(data.roomId).playersCoord.find((player) => player.player.id === data.playerId);
    //     const killedPlayerOldPosition = this.activeGameService
    //         .getActiveGame(data.roomId)
    //         .playersCoord.find((player) => player.player.id !== data.playerId).position;
    //     const fighters = this.combatService.killPlayer(data.roomId, player);
    //     const playerKiller = fighters[0];
    //     const playerKilled = fighters[1];
    //     this.server.to(data.roomId).emit('killedPlayer', {
    //         killer: playerKiller,
    //         killed: playerKilled,
    //         killedOldPosition: killedPlayerOldPosition,
    //     });
    // }

    // winnerPlayer
    @SubscribeMessage('winnerPlayer')
    handleWinnerPlayer(@ConnectedSocket() client, @MessageBody() data: { roomId: string; playerId: string }) {
        const player = this.activeGameService.getActiveGame(data.roomId).playersCoord.find((player) => player.player.id === data.playerId);
        this.combatService.setWinner(data.roomId, player);
        client.emit('winnerPlayer', { roomId: data.roomId, playerId: data.playerId });
    }

    // disperseKilledPlayerObjects (sprint 3)
}
