import { MatchService, PlayerAttribute } from '@app/services/match.service';
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

@WebSocketGateway({ cors: { origin: '*' } })
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

    @SubscribeMessage('createRoom')
    handleCreateRoom(
        @MessageBody() data: { gameId: string; playerName: string; avatar: string; attributes: PlayerAttribute },
        @ConnectedSocket() client: Socket,
    ) {
        console.log('createRoom', data.gameId, data.playerName, data.avatar, data.attributes);
        this.matchService.createRoom(this.server, client, data.gameId, data.playerName, data.avatar, data.attributes);
    }

    @SubscribeMessage('joinRoom')
    handleJoinRoom(
        @MessageBody() data: { roomId: string; playerName: string; avatar: string; attributes: PlayerAttribute },
        @ConnectedSocket() client: Socket,
    ) {
        console.log('joinRoom', data.roomId, data.playerName, data.avatar, data.attributes);
        this.matchService.joinRoom(this.server, client, data.roomId, data.playerName, data.avatar, data.attributes);
    }

    @SubscribeMessage('validRoom')
    handleValidRoom(@MessageBody() roomId: string, @ConnectedSocket() client: Socket) {
        this.matchService.isCodeValid(roomId, client);
    }

    @SubscribeMessage('isRoomLocked')
    handleIsRoomLocked(@MessageBody() roomId: string, @ConnectedSocket() client: Socket) {
        this.matchService.isRoomLocked(roomId, client);
    }

    @SubscribeMessage('getPlayers')
    handleGetPlayers(@MessageBody() roomId: string, @ConnectedSocket() client: Socket) {
        this.matchService.getAllPlayersInRoom(roomId, client);
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

    @SubscribeMessage('startGame')
    startGame(@MessageBody() data: { roomId: string }, @ConnectedSocket() client: Socket) {
        this.matchService.startGame(this.server, client, data.roomId);
    }

    @SubscribeMessage('roomMessage')
    roomMessage(@MessageBody() data: { roomId: string; message: string; date: string }, @ConnectedSocket() client: Socket) {
        this.matchService.roomMessage(this.server, client, data.roomId, data.message, data.date);
    }

    @SubscribeMessage('loadAllMessages')
    loadAllMessages(@MessageBody() data: { roomId: string }, @ConnectedSocket() client: Socket) {
        this.matchService.loadAllMessages(client, data.roomId);
    }
}
