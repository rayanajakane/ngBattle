import { ActionService } from '@app/services/action/action.service';
import { MatchService } from '@app/services/match.service';
import { TileTypes } from '@common/tile-types';
import { ConnectedSocket, MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class ActionGateway implements OnGatewayInit {
    @WebSocketServer() private server: Server;

    // eslint-disable-next-line -- constants must be in SCREAMING_SNAKE_CASE
    private readonly TEN_POURCENT = 0.1;
    // eslint-disable-next-line -- constants must be in SCREAMING_SNAKE_CASE
    private readonly TIME_BETWEEN_MOVES = 150;

    constructor(
        private readonly action: ActionService,
        private readonly match: MatchService,
    ) {}

    @SubscribeMessage('gameSetup')
    handleGameSetup(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
        const gameId = this.match.rooms.get(roomId).gameId;
        const players = this.match.rooms.get(roomId).players;

        this.action.gameSetup(this.server, roomId, gameId, players);
    }

    @SubscribeMessage('startTurn')
    handleStartTurn(@MessageBody() data: { roomId: string; playerId: string }, @ConnectedSocket() client: Socket) {
        const formattedTime = this.getCurrentTimeFormatted();
        const activeGame = this.action.activeGames.find((game) => game.roomId === data.roomId);
        activeGame.currentPlayerMoveBudget = parseInt(activeGame.playersCoord[activeGame.turn].player.attributes.speed, 10);
        activeGame.currentPlayerActionPoint = 1;

        const arrayResponse = this.action.availablePlayerMoves(data.playerId, data.roomId);
        client.emit('startTurn', arrayResponse);

        const playerName = activeGame.playersCoord[activeGame.turn].player.name;
        const message = `Début de tour de ${playerName}`;
        this.server.to(data.roomId).emit('newLog', { date: formattedTime, message, receiver: data.playerId });
    }

    @SubscribeMessage('move')
    handleMove(@MessageBody() data: { roomId: string; playerId: string; endPosition: number }, @ConnectedSocket() client: Socket) {
        const playerId = data.playerId;
        const roomId = data.roomId;
        const activeGame = this.action.activeGames.find((instance) => instance.roomId === roomId);
        const startPosition = activeGame.playersCoord.find((playerCoord) => playerCoord.player.id === playerId).position;

        if (activeGame.playersCoord[activeGame.turn].player.id === playerId) {
            const playerPositions = this.action.movePlayer(roomId, startPosition, data.endPosition);

            const gameMap = this.action.activeGames.find((instance) => instance.roomId === roomId).game.map;
            let iceSlip = false;

            let pastPosition = startPosition;
            playerPositions.forEach((playerPosition) => {
                if (!iceSlip) {
                    setTimeout(() => {
                        this.updatePlayerPosition(data.roomId, data.playerId, playerPosition);
                    }, this.TIME_BETWEEN_MOVES);

                    this.action.activeGames.find((instance) => instance.roomId === roomId).game.map[playerPosition].hasPlayer = true;
                    this.action.activeGames.find((instance) => instance.roomId === roomId).game.map[pastPosition].hasPlayer = false;

                    activeGame.playersCoord.find((playerCoord) => playerCoord.player.id === playerId).position = playerPosition;

                    pastPosition = playerPosition;

                    if (gameMap[playerPosition].tileType === TileTypes.ICE && Math.random() < this.TEN_POURCENT) {
                        activeGame.currentPlayerMoveBudget = 0;
                        iceSlip = true;
                    }
                }
            });

            client.emit('endMove', {
                availableMoves: this.action.availablePlayerMoves(data.playerId, roomId),
                currentMoveBudget: activeGame.currentPlayerMoveBudget,
            });
        }
    }

    @SubscribeMessage('endTurn')
    handleEndTurn(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string; playerId: string; lastTurn: boolean }) {
        const roomId = data.roomId;
        const activeGame = this.action.activeGames.find((game) => game.roomId === roomId);

        if (activeGame.playersCoord[activeGame.turn].player.id === data.playerId) {
            this.action.nextTurn(roomId, data.lastTurn);

            this.server.to(roomId).emit('endTurn', this.action.activeGames.find((game) => game.roomId === roomId).turn);
        }
    }

    @SubscribeMessage('interactDoor')
    handleInteractDoor(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string; playerId: string; doorPosition: number }) {
        const roomId = data.roomId;
        const doorPosition = data.doorPosition;
        const remainingActionPoints = this.action.activeGames.find((game) => game.roomId === roomId).currentPlayerActionPoint;

        const map = this.action.activeGames.find((game) => game.roomId === roomId).game.map;

        if (remainingActionPoints > 0) {
            const isToggable = this.action.interactWithDoor(roomId, data.playerId, data.doorPosition);
            this.server.to(roomId).emit('interactDoor', {
                isToggable,
                doorPosition,
                availableMoves: this.action.availablePlayerMoves(data.playerId, roomId),
            });

            const playerName = this.action.activeGames
                .find((game) => game.roomId === roomId)
                .playersCoord.find((playerCoord) => playerCoord.player.id === data.playerId).player.name;

            let message = '';
            if (map[doorPosition].tileType === TileTypes.DOOROPEN) {
                message = `Porte a été ouverte par ${playerName}`;
            } else if (map[doorPosition].tileType === TileTypes.DOORCLOSED) {
                message = `Porte a été ouverte par ${playerName}`;
            }

            this.server.to(roomId).emit('newLog', { date: this.getCurrentTimeFormatted(), message, receiver: data.playerId });
        }
    }

    @SubscribeMessage('quitGame')
    handleQuitGame(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string; playerId: string }) {
        const activeGame = this.action.activeGames.find((game) => game.roomId === data.roomId);
        const roomId = data.roomId;
        const playerId = data.playerId;

        this.server.to(roomId).emit('quitGame', playerId);

        const playerName = activeGame.playersCoord.find((playerCoord) => playerCoord.player.id === playerId).player.name;
        const message = `${playerName} a quitté la partie`;
        this.server.to(roomId).emit('newLog', { date: this.getCurrentTimeFormatted(), message, receiver: playerId });

        if (activeGame.playersCoord[activeGame.turn].player.id === playerId) {
            this.handleEndTurn(client, { ...data, lastTurn: true });
        }
    }

    updatePlayerPosition(roomId: string, playerId: string, newPlayerPosition: number) {
        this.server.to(roomId).emit('playerPositionUpdate', {
            playerId,
            newPlayerPosition,
        });
    }

    afterInit(server: Server) {
        this.server = server;
    }

    private getCurrentTimeFormatted(): string {
        const currentTime = new Date();
        return currentTime.toTimeString().split(' ')[0]; // HH:MM:SS
    }
}
