import { ActionHandlerService } from '@app/services/action-handler/action-handler.service';
import { MatchService } from '@app/services/match.service';
import { PlayerAttribute } from '@common/player';
import { Inject } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class MatchGateway implements OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() private server: Server;

    constructor(
        @Inject() private readonly matchService: MatchService,
        private readonly actionHandler: ActionHandlerService,
    ) {}

    @SubscribeMessage('createRoom')
    handleCreateRoom(
        @MessageBody() data: { gameId: string; playerName: string; avatar: string; attributes: PlayerAttribute },
        @ConnectedSocket() client: Socket,
    ) {
        const playerData = { playerName: data.playerName, avatar: data.avatar, attributes: data.attributes };
        this.matchService.createRoom(this.server, client, data.gameId, playerData);
    }

    @SubscribeMessage('joinRoom')
    handleJoinRoom(
        @MessageBody() data: { roomId: string; playerName: string; avatar: string; attributes: PlayerAttribute },
        @ConnectedSocket() client: Socket,
    ) {
        const playerData = { playerName: data.playerName, avatar: data.avatar, attributes: data.attributes };
        this.matchService.joinRoom(this.server, client, data.roomId, playerData);
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

    @SubscribeMessage('getMaxPlayers')
    getMaxPlayers(@MessageBody() data: { roomId: string }, @ConnectedSocket() client: Socket) {
        this.matchService.getMaxPlayers(data.roomId, client);
    }

    @SubscribeMessage('roomMessage')
    roomMessage(@MessageBody() data: { roomId: string; message: string; date: string }, @ConnectedSocket() client: Socket) {
        this.matchService.roomMessage(this.server, client, data.roomId, data.message, data.date);
    }

    @SubscribeMessage('loadAllMessages')
    loadAllMessages(@MessageBody() data: { roomId: string }, @ConnectedSocket() client: Socket) {
        this.matchService.loadAllMessages(client, data.roomId);
    }

    afterInit(server: Server) {
        this.server = server;
    }

    handleDisconnect(client: Socket) {
        console.log('Client disconnected ( from handleDisconnect):', client.id);
        this.actionHandler.handleQuitGame(this.server, client);
        this.matchService.leaveAllRooms(this.server, client);
    }
}
