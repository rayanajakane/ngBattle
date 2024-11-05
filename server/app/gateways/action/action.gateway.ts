import { ActionService } from '@app/services/action/action.service';
import { MatchService } from '@app/services/match.service';
import { ConnectedSocket, MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PlayerInfo } from '../../services/action/action.service';

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
        console.log('ActionGateway initialized');
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

        const playerCoords: PlayerInfo[] = this.action.gameSetup(roomId, gameId, players);

        console.log(playerCoords);

        this.server.to(roomId).emit('gameSetup', playerCoords);
    }

    //TODO: check usefulness of this function
    @SubscribeMessage('startTurn')
    handleStartTurn(@MessageBody() data: { roomId: string; playerId: string }, @ConnectedSocket() client: Socket) {
        const activeGame = this.action.activeGames.find((game) => game.roomId === data.roomId);

        activeGame.currentPlayerMoveBudget = parseInt(activeGame.playersCoord[activeGame.turn].player.attributes.speed);
        activeGame.currentPlayerActionPoint = 1;

        //TODO: send the move budget to the client
        client.emit('startTurn', this.action.availablePlayerMoves(data.playerId, activeGame.game.id));
    }

    @SubscribeMessage('move')
    handleMove(
        @MessageBody() data: { roomId: string; playerId: string; startPosition: number; endPosition: number },
        @ConnectedSocket() client: Socket,
    ) {
        const playerId = data.playerId;
        const roomId = data.roomId;
        const activeGame = this.action.activeGames.find((instance) => instance.roomId === roomId);

        if (activeGame.playersCoord[activeGame.turn].player.id === playerId) {
            const playerPositions = this.action.movePlayer(activeGame.game.id, data.startPosition, data.endPosition);

            const gameMap = this.action.activeGames.find((instance) => instance.roomId === roomId).game.map;
            let iceSlip = false;

            console.log('startMove');
            let pastPosition = data.startPosition;
            playerPositions.forEach((playerPosition) => {
                if (!iceSlip) {
                    setTimeout(() => {
                        this.updatePlayerPosition(data.roomId, data.playerId, playerPosition);
                    }, 150);

                    this.action.activeGames.find((instance) => instance.roomId === roomId).game.map[playerPosition].hasPlayer = true;
                    this.action.activeGames.find((instance) => instance.roomId === roomId).game.map[pastPosition].hasPlayer = false;

                    activeGame.playersCoord.find((playerCoord) => playerCoord.player.id === playerId).position = playerPosition;

                    pastPosition = playerPosition;

                    if (gameMap[playerPosition].tileType == TileTypes.ICE && Math.random() * (10 - 1) + 1 === 1) {
                        console.log('iceSlip');
                        iceSlip = true;
                    }
                }
            });
            console.log('endMove');
            console.log('nextTurn: ' + activeGame.turn);

            client.emit('endMove', {
                availableMoves: this.action.availablePlayerMoves(data.playerId, activeGame.game.id),
                currentMoveBudget: activeGame.currentPlayerMoveBudget,
            });
        }
    }

    @SubscribeMessage('endTurn')
    handleEndTurn(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string; playerId: string }) {
        const roomId = data.roomId;
        const activeGame = this.action.activeGames.find((game) => game.roomId === roomId);

        if (activeGame.playersCoord[activeGame.turn].player.id !== data.playerId) {
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
            console.log('Door interacted');
        }
        console.log('Door not interacted');
    }
}
