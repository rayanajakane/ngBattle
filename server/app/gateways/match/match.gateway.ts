import { MatchService } from '@app/services/match.service';
import { Inject } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class MatchGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    private server: Server;

    constructor(@Inject() private readonly matchService: MatchService) {}

    afterInit(server: Server) {
        this.server = server;
    }

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
        this.matchService.leaveAllRooms(this.server, client);
    }

    @SubscribeMessage('joinRoom')
    handleJoinRoom(@MessageBody() data: { gameId: string; roomId: string; playerName: string }, @ConnectedSocket() client: Socket) {
        this.matchService.joinRoom(this.server, client, data.gameId, data.roomId, data.playerName);
    }

    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(@MessageBody() roomId: string, @ConnectedSocket() client: Socket) {
        this.matchService.leaveRoom(this.server, client, roomId);
    }

    @SubscribeMessage('lockRoom')
    handleLockRoom(@MessageBody() roomId: string, @ConnectedSocket() client: Socket) {
        this.matchService.lockRoom(this.server, client, roomId);
    }

    @SubscribeMessage('unlockRoom')
    handleUnlockRoom(@MessageBody() roomId: string, @ConnectedSocket() client: Socket) {
        this.matchService.unlockRoom(this.server, client, roomId);
    }

    @SubscribeMessage('kickPlayer')
    handleKickPlayer(@MessageBody() data: { roomId: string; playerId: string }, @ConnectedSocket() client: Socket) {
        this.matchService.kickPlayer(this.server, client, data.roomId, data.playerId);
    }
}
