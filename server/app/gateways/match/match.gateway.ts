import { ActionHandlerService } from '@app/services/action-handler/action-handler.service';
import { ActionService } from '@app/services/action/action.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { DebugModeService } from '@app/services/debug-mode/debug-mode.service';
import { MatchService } from '@app/services/match.service';
import { PlayerAttribute } from '@common/player';
import { TileTypes } from '@common/tile-types';
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
        private readonly actionHandlerService: ActionHandlerService,
        private readonly action: ActionService,
        private debugModeService: DebugModeService,
        private activeGamesService: ActiveGamesService,
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
        @MessageBody()
        data: { roomId: string; playerName: string; avatar: string; attributes: PlayerAttribute; isVirtual: boolean; virtualProfile: string },
        @ConnectedSocket() client: Socket,
    ) {
        const playerData = { playerName: data.playerName, avatar: data.avatar, attributes: data.attributes, virtualProfile: data.virtualProfile };
        this.matchService.joinRoom(this.server, client, data.roomId, playerData, data.isVirtual);
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

    @SubscribeMessage('requestDebugMode')
    handleDebugMode(@MessageBody() data: { roomId: string; playerId: string }) {
        this.debugModeService.switchDebugMode(data.roomId);
        const formattedTime = this.actionHandlerService.getCurrentTimeFormatted();
        const logMessage = 'Mode débogage est ' + (this.debugModeService.getDebugMode(data.roomId) ? 'activé' : 'désactivé');
        this.server.to(data.roomId).emit('newLog', { date: formattedTime, message: logMessage, receiver: data.playerId, exclusive: false });
        this.server.to(data.roomId).emit('responseDebugMode', { isDebugMode: this.debugModeService.getDebugMode(data.roomId) });
    }

    @SubscribeMessage('teleportPlayer')
    handleTeleportPlayer(@MessageBody() data: { roomId: string; playerId: string; index: number }) {
        if (this.debugModeService.getDebugMode(data.roomId)) {
            console.log('REQUETE RECU VOILA  ', data);
            const gameInstance = this.activeGamesService.getActiveGame(data.roomId);
            const playerStart = gameInstance.playersCoord.find((playerCoord) => playerCoord.player.id === data.playerId);
            const playerStartIndex = playerStart.position;
            const currentPlayerMoveBudget = gameInstance.currentPlayerMoveBudget;
            const map = gameInstance.game.map;
            if (!map[data.index].hasPlayer && map[data.index].tileType !== TileTypes.WALL && map[data.index].tileType !== TileTypes.DOORCLOSED) {
                map[playerStartIndex].hasPlayer = false;
                map[data.index].hasPlayer = true;
                gameInstance.playersCoord.find((playerCoord) => playerCoord.player.id === data.playerId).position = data.index;
                const availableMoves = this.action.availablePlayerMoves(data.playerId, data.roomId);
                this.server.to(data.roomId).emit('teleportResponse', {
                    playerId: data.playerId,
                    newPosition: data.index,
                    availableMoves: availableMoves,
                    currentPlayerMoveBudget: currentPlayerMoveBudget,
                });
            }
        }
    }

    handleDisconnect(client: Socket) {
        let roomId = '';
        let isAdmin = false;
        this.matchService.rooms.forEach((room) => {
            let player = room.players.find((player) => player.id === client.id);
            if (player) {
                roomId = room.id;
                isAdmin = player.isAdmin;
            }
        });
        if (isAdmin) {
            this.debugModeService.debugModeOff(roomId);
            this.server.to(roomId).emit('responseDebugMode', { isDebugMode: this.debugModeService.getDebugMode(roomId) });
        }
        this.actionHandlerService.handleQuitGame(this.server, client);
        this.matchService.leaveAllRooms(this.server, client);
    }
    afterInit(server: Server) {
        this.server = server;
    }
}
