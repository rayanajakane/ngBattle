import { ActionService } from '@app/services/action/action.service';
import { MatchService } from '@app/services/match.service';
import { ConnectedSocket, MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export enum TileTypes {
    BASIC = '',
    WALL = 'wall',
    DOOR = 'door',
    DOOROPEN = 'doorOpen',
    DOORCLOSED = 'doorClosed',
    WATER = 'water',
    ICE = 'ice',
}
@WebSocketGateway({ cors: { origin: '*' } })
export class ActionGateway implements OnGatewayInit {
    @WebSocketServer() private server: Server;

    constructor(
        private readonly action: ActionService,
        private readonly match: MatchService,
    ) {}

    afterInit(server: Server) {
        this.server = server;
    }

    getCurrentTimeFormatted(): string {
        const currentTime = new Date();
        return currentTime.toTimeString().split(' ')[0]; // HH:MM:SS
    }

    updatePlayerPosition(roomId: string, playerId: string, newPlayerPosition: number) {
        this.server.to(roomId).emit('playerPositionUpdate', {
            playerId,
            newPlayerPosition,
        });
    }

    @SubscribeMessage('gameSetup')
    handleGameSetup(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
        const gameId = this.match.rooms.get(roomId).gameId;
        const players = this.match.rooms.get(roomId).players;

        this.action.gameSetup(this.server, roomId, gameId, players);
    }

    //TODO: check usefulness of this function
    @SubscribeMessage('startTurn')
    handleStartTurn(@MessageBody() data: { roomId: string; playerId: string }, @ConnectedSocket() client: Socket) {
        const formattedTime = this.getCurrentTimeFormatted();
        const activeGame = this.action.activeGames.find((game) => game.roomId === data.roomId);
        console.log('playerId', data.playerId);
        activeGame.currentPlayerMoveBudget = parseInt(activeGame.playersCoord[activeGame.turn].player.attributes.speed);
        activeGame.currentPlayerActionPoint = 1;

        console.log('startTurn', activeGame.playersCoord[activeGame.turn].player.id);

        //TODO: send the move budget to the client
        const arrayResponse = this.action.availablePlayerMoves(data.playerId, data.roomId);
        client.emit('startTurn', arrayResponse);

        const playerName = activeGame.playersCoord[activeGame.turn].player.name;
        const message = `Début de tour de ${playerName}`;
        this.server.to(data.roomId).emit('newLog', { date: formattedTime, message: message, receiver: data.playerId });
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
                    }, 150);

                    this.action.activeGames.find((instance) => instance.roomId === roomId).game.map[playerPosition].hasPlayer = true;
                    this.action.activeGames.find((instance) => instance.roomId === roomId).game.map[pastPosition].hasPlayer = false;

                    activeGame.playersCoord.find((playerCoord) => playerCoord.player.id === playerId).position = playerPosition;

                    pastPosition = playerPosition;

                    if (gameMap[playerPosition].tileType == TileTypes.ICE && Math.random() < 0.1) {
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
    handleEndTurn(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string; playerId: string }) {
        const roomId = data.roomId;
        const activeGame = this.action.activeGames.find((game) => game.roomId === roomId);

        if (activeGame.playersCoord[activeGame.turn].player.id === data.playerId) {
            console.log('endTurn in if ', data.playerId);

            this.action.nextTurn(roomId);

            //TODO: send the new active player to the client
            this.server.to(roomId).emit('endTurn', this.action.activeGames.find((game) => game.roomId === roomId).turn);
        }
    }

    @SubscribeMessage('interactDoor')
    handleInteractDoor(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string; playerId: string; doorPosition: number }) {
        const roomId = data.roomId;
        const doorPosition = data.doorPosition;
        const remainingActionPoints = this.action.activeGames.find((game) => game.roomId === roomId).currentPlayerActionPoint;

        if (remainingActionPoints > 0) {
            this.action.interactWithDoor(roomId, data.playerId, data.doorPosition);
            this.server.to(roomId).emit('interactDoor', doorPosition);

            if (this.action.activeGames.find((game) => game.roomId === roomId).game.map[doorPosition].tileType === TileTypes.DOOROPEN) {
                this.server.to(roomId).emit('newLog', { date: this.getCurrentTimeFormatted(), message: 'Porte a été ouverte' });
            } else if (this.action.activeGames.find((game) => game.roomId === roomId).game.map[doorPosition].tileType === TileTypes.DOORCLOSED) {
                this.server.to(roomId).emit('newLog', { date: this.getCurrentTimeFormatted(), message: 'Porte a été fermée' });
            }
            console.log('Door interacted');
        }
        console.log('Door not interacted');
    }

    @SubscribeMessage('startFight')
    handleStartFight(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string; attackerId: string; defenderId: string }) {
        const roomId = data.roomId;
        const remainingActionPoints = this.action.activeGames.find((game) => game.roomId === roomId).currentPlayerActionPoint;

        if (remainingActionPoints > 0) {
            this.action.startFight(this.server, roomId, data.attackerId, data.defenderId);
            this.server.to(roomId).emit('Fight', { attackerId: data.attackerId, defenderId: data.defenderId });
        }
    }

    @SubscribeMessage('quitGame')
    handleQuitGame(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string; playerId: string }) {
        const activeGame = this.action.activeGames.find((game) => game.roomId === data.roomId);
        const roomId = data.roomId;
        const playerId = data.playerId;

        console.log('quitGame', playerId);
        if (activeGame.playersCoord[activeGame.turn].player.id === playerId) {
            this.handleEndTurn(client, data);
        }

        this.action.quitGame(roomId, playerId);

        this.server.to(roomId).emit('quitGame', playerId);
    }
}
