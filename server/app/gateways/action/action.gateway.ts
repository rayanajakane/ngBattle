import { ActionService } from '@app/services/action/action.service';
import { MatchService } from '@app/services/match.service';
import { Inject } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PlayerCoord } from '../../services/action/action.service';
@WebSocketGateway({ cors: { origin: '*' } })
export class ActionGateway implements OnGatewayInit {
    @WebSocketServer() private server: Server;

    constructor(
        @Inject() private readonly action: ActionService,
        private readonly match: MatchService,
    ) {}

    afterInit(server: Server) {
        this.server = server;
        console.log('ActionGateway initialized');
    }

    @SubscribeMessage('gameSetup')
    handleGameSetup(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
        const gameId = this.match.rooms.get(roomId).gameId;
        const players = this.match.rooms.get(roomId).players;
        const playerCoords: PlayerCoord[] = this.action.gameSetup(gameId, players);
        console.log(playerCoords);
        client.emit('gameSetup', playerCoords);
    }

    @SubscribeMessage('move')
    handleMove(
        @MessageBody() data: { gameId: string; playerId: string; startPosition: number; endPosition: number },
        @ConnectedSocket() client: Socket,
    ) {
        client.emit('move', this.action.movePlayer(data.playerId, data.gameId, data.startPosition, data.endPosition));
    }

    @SubscribeMessage('scout')
    handleScout(
        @MessageBody() data: { gameId: string; playerId: string; startPosition: number; endPosition: number },
        @ConnectedSocket() client: Socket,
    ) {
        client.emit('scout', this.action.availablePlayerMoves(data.playerId, data.gameId, data.startPosition, data.endPosition));
    }
}
