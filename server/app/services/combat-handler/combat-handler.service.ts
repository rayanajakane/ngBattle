import { ActionButtonService } from '@app/services/action-button/action-button.service';
import { ActionHandlerService } from '@app/services/action-handler/action-handler.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { CombatService } from '@app/services/combat/combat.service';
import { VirtualPlayerService } from '@app/services/virtual-player/virtual-player.service';
import { CombatAction } from '@common/combat-actions';
import { TileTypes } from '@common/tile-types';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@Injectable()
export class CombatHandlerService {
    constructor(
        private readonly activeGameService: ActiveGamesService,
        private readonly actionButtonService: ActionButtonService,
        @Inject(forwardRef(() => CombatService)) private readonly combatService: CombatService,
        @Inject(forwardRef(() => ActionHandlerService)) private readonly actionHandlerService: ActionHandlerService,
        @Inject(forwardRef(() => VirtualPlayerService)) private readonly virtualPlayerService: VirtualPlayerService,
    ) {}

    handleStartAction(roomId: string, playerId: string, client: Socket) {
        const fighter = this.activeGameService.getActiveGame(roomId).playersCoord.find((player) => player.player.id === playerId);
        client.emit('startAction', this.actionButtonService.getAvailableIndexes(roomId, fighter));
    }

    handleCheckAction(roomId: string, playerId: string, client: Socket) {
        const fighter = this.activeGameService.getActiveGame(roomId).playersCoord.find((player) => player.player.id === playerId);
        client.emit('checkValidAction', this.actionButtonService.getAvailableIndexes(roomId, fighter));
    }

    handleAction(roomId: string, playerId: string, target: number, client: Socket, server: Server) {
        const initialPlayer = this.activeGameService.getActiveGame(roomId).playersCoord.find((player) => player.player.id === playerId);
        if (this.activeGameService.getActiveGame(roomId).game.map[target].hasPlayer) {
            const targetPlayer = this.activeGameService.getActiveGame(roomId).playersCoord.find((player) => player.position === target);
            const fighters = [initialPlayer, targetPlayer];
            const [firstTurnPlayer, secondTurnPlayer] = this.combatService.startCombat(roomId, fighters);
            server
                .to(roomId)
                .emit('startCombat', { attacker: firstTurnPlayer, defender: secondTurnPlayer, combatInitiatorId: initialPlayer.player.id });

            const formattedTime = this.actionHandlerService.getCurrentTimeFormatted();
            const message = `Combat entre ${firstTurnPlayer.player.name} et ${secondTurnPlayer.player.name} a été débuté`;
            server
                .to(roomId)
                .emit('newLog', { date: formattedTime, message, sender: firstTurnPlayer.player.id, receiver: secondTurnPlayer.player.id });
        } else if (
            this.activeGameService.getActiveGame(roomId).game.map[target].tileType === TileTypes.DOORCLOSED ||
            this.activeGameService.getActiveGame(roomId).game.map[target].tileType === TileTypes.DOOROPEN
        ) {
            const newData = { roomId: roomId, playerId: playerId, doorPosition: target };
            this.actionHandlerService.handleInteractDoor(newData, server, client);
        }
    }

    async handleCombatAttack(roomId: string, playerId: string, server: Server) {
        if (this.combatService.getCurrentTurnPlayer(roomId).player.id === playerId) {
            const initialPlayer = this.activeGameService.getActiveGame(roomId).playersCoord.find((player) => player.player.id === playerId);
            const targetPlayer = this.combatService.getFighters(roomId).find((player) => player.player.id !== playerId);

            const [attackerDice, defenderDice, combatStatus, defender, isAttackSuccessful] = this.combatService.attack(
                roomId,
                initialPlayer,
                targetPlayer,
                server,
            );

            server.to(roomId).emit('attacked', {
                attacker: initialPlayer,
                attackerDice,
                defender,
                defenderDice,
                isAttackSuccessful,
            });

            const formattedTime = this.actionHandlerService.getCurrentTimeFormatted();
            const attackResult = isAttackSuccessful ? 'réussi' : 'échoué';
            const message = `${initialPlayer.player.name} attaque ${defender.player.name}. \n L'attaque a ${attackResult}. \n
            Jet de dé attaquant: ${attackerDice}.\n Jet de dé défenseur: ${defenderDice}\n
            calcul: ${initialPlayer.player.attributes.attack + attackerDice} vs ${defender.player.attributes.defense + defenderDice}`;
            server
                .to(roomId)
                .emit('newLog', { date: formattedTime, message, sender: initialPlayer.player.id, receiver: defender.player.id, exclusive: true });

            if (combatStatus === 'combatTurnEnd') {
                this.combatService.startCombatTurn(roomId, defender);
                server.to(roomId).emit('changeCombatTurn', defender.player.id);
                if (defender.player.isVirtual) {
                    this.virtualPlayerService.roomId = roomId;
                    this.virtualPlayerService.virtualPlayerId = defender.player.id;
                    this.virtualPlayerService.server = server;
                    await this.virtualPlayerService.fight(isAttackSuccessful);
                }
            }
        }
    }

    async handleCombatEscape(roomId: string, playerId: string, server: Server) {
        const fighter = this.activeGameService.getActiveGame(roomId).playersCoord.find((player) => player.player.id === playerId);
        const defender = this.combatService.getFighters(roomId).find((player) => player.player.id !== playerId);

        const [remainingEscapeChances, escapeResult] = this.combatService.escape(roomId, fighter);
        server.to(roomId).emit('didEscape', { playerId: playerId, remainingEscapeChances, hasEscaped: escapeResult });
        const formattedTime = this.actionHandlerService.getCurrentTimeFormatted();

        if (escapeResult) {
            console.log('escape successful');
            const message = `${fighter.player.name} a réussi à s'échapper du combat`;
            server.to(roomId).emit('newLog', { date: formattedTime, message, receiver: defender.player.id, sender: playerId, exclusive: true });
            this.combatService.endCombat(roomId, server, fighter);
        } else {
            console.log('escape failed');
            const message = `${fighter.player.name} a échoué à s'échapper du combat`;
            server.to(roomId).emit('newLog', { date: formattedTime, message, receiver: defender.player.id, sender: playerId, exclusive: true });
            if (!defender.player.isVirtual) {
                this.combatService.startCombatTurn(roomId, defender);
                server.to(roomId).emit('changeCombatTurn', defender.player.id);
            } else if (defender.player.isVirtual) {
                console.log('virtual player attakcs');
                server.to(roomId).emit('changeCombatTurn', defender.player.id);
                this.virtualPlayerService.roomId = roomId;
                this.virtualPlayerService.virtualPlayerId = defender.player.id;
                this.virtualPlayerService.server = server;
                await this.virtualPlayerService.fight(false);
            }
        }
    }

    handleStartCombatTurn(roomId: string, playerId: string, combatAction: CombatAction, server: Server) {
        const fighter = this.activeGameService.getActiveGame(roomId).playersCoord.find((player) => player.player.id === playerId);
        this.combatService.startCombatTurn(roomId, fighter);
        server.to(roomId).emit('changeCombatTurn', { playerId: playerId, combatAction: combatAction });
    }

    handleEndCombat(roomId: string, playerId: string, server: Server) {
        const fighter = this.activeGameService.getActiveGame(roomId).playersCoord.find((player) => player.player.id === playerId);
        const fighters = this.combatService.endCombat(roomId, server, fighter);
        server.to(roomId).emit('endCombat', fighters);
    }

    handleWinnerPlayer(roomId: string, playerId: string, client: Socket) {
        const fighter = this.activeGameService.getActiveGame(roomId).playersCoord.find((player) => player.player.id === playerId);
        this.combatService.setWinner(roomId, fighter);
        client.emit('winnerPlayer', { roomId: roomId, playerId: playerId });
    }
}
