import { ActionButtonService } from '@app/services/action-button/action-button.service';
import { ActionHandlerService } from '@app/services/action-handler/action-handler.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { CombatService } from '@app/services/combat/combat.service';
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
    ) {
        console.log('Combat Gateway created');
    }

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
        }
        if (
            this.activeGameService.getActiveGame(data.roomId).game.map[data.target].tileType === TileTypes.DOORCLOSED ||
            this.activeGameService.getActiveGame(data.roomId).game.map[data.target].tileType === TileTypes.DOOROPEN
        ) {
            const newData = { roomId: data.roomId, playerId: data.playerId, doorPosition: data.target };
            this.actionHandlerService.handleInteractDoor(newData, this.server, client);
        }
        // TODO: set the socket response to the client or all clients in the room
    }

    // get available indexes start action

    // start combat action
}
