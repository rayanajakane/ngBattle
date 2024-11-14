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
            this.combatService.startCombat(data.roomId, fighters);
            this.server.to(data.roomId).emit('startCombat', { attacker: fighters[0], defender: fighters[1] });
        } else if (
            this.activeGameService.getActiveGame(data.roomId).game.map[data.target].tileType === TileTypes.DOORCLOSED ||
            this.activeGameService.getActiveGame(data.roomId).game.map[data.target].tileType === TileTypes.DOOROPEN
        ) {
            const newData = { roomId: data.roomId, playerId: data.playerId, doorPosition: data.target };
            this.actionHandlerService.handleInteractDoor(newData, this.server, client);
        }
    }

    @SubscribeMessage('attack')
    handleAttack(@ConnectedSocket() client, @MessageBody() data: { roomId: string; playerId: string; target: number }) {
        const player = this.activeGameService.getActiveGame(data.roomId).playersCoord.find((player) => player.player.id === data.playerId);
        const targetPlayer = this.activeGameService.getActiveGame(data.roomId).playersCoord.find((player) => player.position === data.target);
        const dices = this.combatService.attack(data.roomId, player, targetPlayer).slice(0, 1);
        const combatStatus = this.combatService.attack(data.roomId, player, targetPlayer)[2];
        if (combatStatus === 'combatEnd') {
            client.emit('combatEnd', { roomId: data.roomId, playerId: data.playerId });
        }
        if (combatStatus === 'combatTurnEnd') {
            client.emit('endCombatTurn', { roomId: data.roomId, playerId: data.playerId });
        }
        client.emit('attacked', { attacker: player, attackerDice: dices[0], defender: targetPlayer, defenderDice: dices[1] });
    }

    // escape
    @SubscribeMessage('escape')
    handleEscape(@ConnectedSocket() client, @MessageBody() data: { roomId: string; playerId: string }) {
        const player = this.activeGameService.getActiveGame(data.roomId).playersCoord.find((player) => player.player.id === data.playerId);
        const escapeResult = this.combatService.escape(data.roomId, player);
        client.emit('didEscape', { roomId: data.roomId, playerId: data.playerId, result: escapeResult });
    }

    // startCombatTurn
    @SubscribeMessage('startCombatTurn')
    handleStartCombatTurn(@ConnectedSocket() client, @MessageBody() data: { roomId: string; playerId: string; combatAction: CombatAction }) {
        const player = this.activeGameService.getActiveGame(data.roomId).playersCoord.find((player) => player.player.id === data.playerId);
        this.combatService.startCombatTurn(data.roomId, player, data.combatAction);
        client.emit('startCombatTurn', { roomId: data.roomId, playerId: data.playerId, combatAction: data.combatAction });
    }

    // endCombatTurn
    @SubscribeMessage('endCombatTurn')
    handleEndCombatTurn(@ConnectedSocket() client, @MessageBody() data: { roomId: string; playerId: string }) {
        const player = this.activeGameService.getActiveGame(data.roomId).playersCoord.find((player) => player.player.id === data.playerId);
        this.combatService.endCombatTurn(data.roomId, player);
        client.emit('endCombatTurn', { roomId: data.roomId, playerId: data.playerId });
    }

    // endCombat
    @SubscribeMessage('endCombat')
    handleEndCombat(@ConnectedSocket() client, @MessageBody() data: { roomId: string; playerId: string }) {
        const player = this.activeGameService.getActiveGame(data.roomId).playersCoord.find((player) => player.player.id === data.playerId);
        const fighters = this.combatService.endCombat(data.roomId, player);
        client.emit('endCombat', { roomId: data.roomId, playerId: data.playerId, attacker: fighters[0], defender: fighters[1] });
    }

    // killedPlayer + KilledPlayerHomePosition
    @SubscribeMessage('killedPlayer')
    handleKilledPlayer(@ConnectedSocket() client, @MessageBody() data: { roomId: string; playerId: string }) {
        const player = this.activeGameService.getActiveGame(data.roomId).playersCoord.find((player) => player.player.id === data.playerId);
        const fighters = this.combatService.killPlayer(data.roomId, player);
        const playerKiller = fighters[0];
        const playerKilled = fighters[1];
        client.emit('killedPlayer', { roomId: data.roomId, playerId: data.playerId, killer: playerKiller, killed: playerKilled });
    }

    // winnerPlayer
    @SubscribeMessage('winnerPlayer')
    handleWinnerPlayer(@ConnectedSocket() client, @MessageBody() data: { roomId: string; playerId: string }) {
        const player = this.activeGameService.getActiveGame(data.roomId).playersCoord.find((player) => player.player.id === data.playerId);
        this.combatService.setWinner(data.roomId, player);
        client.emit('winnerPlayer', { roomId: data.roomId, playerId: data.playerId });
    }

    // disperseKilledPlayerObjects (sprint 3)
}
