import { ActionButtonService } from '@app/services/action-button/action-button.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { CombatService } from '@app/services/combat/combat.service';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
@WebSocketGateway()
export class CombatGateway {
    @WebSocketServer() server: Server;

    constructor(
        private readonly activeGameService: ActiveGamesService,
        private readonly combatService: CombatService,
        private readonly actionButtonService: ActionButtonService,
    ) {
        console.log('Combat Gateway created');
    }

    @SubscribeMessage('message')
    handleMessage(client: unknown, payload: unknown): string {
        return 'Hello world!';
    }

    @SubscribeMessage('startAction')
    handleStartAction(@ConnectedSocket() client, @MessageBody() data: { roomId: string; playerId: string }) {
        const playerCoord = this.activeGameService.getActiveGame(data.roomId).playersCoord.find((player) => player.player.id === data.playerId);
        this.actionButtonService.getAvailableIndexes(data.roomId, playerCoord);

        // TODO: set the socket response to the client or all clients in the room
    }

    @SubscribeMessage('action')
    handleAction(@ConnectedSocket() client, @MessageBody() data: { roomId: string; playerId: string; target: number }) {
        //TODO: identify the target player in the front end to send a start action message instead of interpreting the target here (cant know if an item is targeted or a player)
        const playerCoord = this.activeGameService.getActiveGame(data.roomId).playersCoord.find((player) => player.player.id === data.playerId);
        const targetPlayer = this.activeGameService.getActiveGame(data.roomId).playersCoord.find((player) => player.position === data.target);

        this.combatService.startCombat(data.roomId, [playerCoord, targetPlayer]);

        //TODO: set the socket response to the client or all clients in the room
    }
    // get available indexes start action

    // start combat action
}
