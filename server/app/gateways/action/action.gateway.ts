import { ActionService } from '@app/services/action/action.service';
import { MatchService } from '@app/services/match.service';
import { Inject } from '@nestjs/common';
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
        @Inject() private readonly action: ActionService,
        private readonly match: MatchService,
    ) {}

    afterInit(server: Server) {
        this.server = server;
        console.log('ActionGateway initialized');
    }

    async updatePlayerPosition(playerId: string, newPlayerPosition: number) {
        this.server.emit('playerPositionUpdate', {
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
        this.server.emit('gameSetup', playerCoords);
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
        @MessageBody() data: { gameId: string; playerId: string; startPosition: number; endPosition: number },
        @ConnectedSocket() client: Socket,
    ) {
        const playerId = data.playerId;
        const activeGame = this.action.activeGames.find((game) => game.game.id === data.gameId);

        if (activeGame.playersCoord[activeGame.turn].player.id !== playerId) {
            const playerPositions = this.action.movePlayer(data.gameId, data.startPosition, data.endPosition);

            const gameMap = this.action.activeGames.find((game) => game.game.id === data.gameId).game.map;
            let iceSlip = false;

            console.log('startMove');
            let pastPosition = data.startPosition;
            playerPositions.forEach((playerPosition) => {
                if (!iceSlip) {
                    setTimeout(() => {
                        this.updatePlayerPosition(data.playerId, playerPosition);
                    }, 150);

                    this.action.activeGames.find((game) => game.game.id === data.gameId).game.map[playerPosition].hasPlayer = true;
                    this.action.activeGames.find((game) => game.game.id === data.gameId).game.map[pastPosition].hasPlayer = false;

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
                availableMoves: this.action.availablePlayerMoves(data.playerId, data.gameId),
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
            this.server.emit('endTurn', this.action.activeGames.find((game) => game.roomId === roomId).turn);
        }
    }

    @SubscribeMessage('interactDoor')
    handleInteractDoor(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string; playerId: string; doorPosition: number }) {
        const roomId = data.roomId;
        const doorPosition = data.doorPosition;
        const remainingActionPoints = this.action.activeGames.find((game) => game.roomId === roomId).currentPlayerActionPoint;

        if (remainingActionPoints > 0) {
            this.action.interactWithDoor(roomId, data.playerId, data.doorPosition);
            this.server.emit('interactDoor', doorPosition);
            console.log('Door interacted');
        }
        console.log('Door not interacted');
    }

    @SubscribeMessage('attack')
    handleAttack(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string; playerId: string; targetId: string }) {}
}
