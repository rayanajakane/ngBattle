import { TileTypes } from '@app/gateways/action/action.gateway';
import { ActionService } from '@app/services/action/action.service';
import { MatchService } from '@app/services/match.service';
import { Player } from '@common/player';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
@Injectable()
export class ActionHandlerService {
    constructor(
        private action: ActionService,
        private readonly match: MatchService,
    ) {}

    // eslint-disable-next-line -- constants must be in SCREAMING_SNAKE_CASE
    private readonly TEN_POURCENT = 0.1;
    // eslint-disable-next-line -- constants must be in SCREAMING_SNAKE_CASE
    private readonly TIME_BETWEEN_MOVES = 150;

    private getCurrentTimeFormatted(): string {
        const currentTime = new Date();
        return currentTime.toTimeString().split(' ')[0]; // HH:MM:SS
    }

    private sendStartTurnLogMessage(server: Server, roomId: string, player: Player) {
        const formattedTime = this.getCurrentTimeFormatted();
        const playerName = player.name;

        const message = `Début de tour de ${playerName}`;
        server.to(roomId).emit('newLog', { date: formattedTime, message });
    }

    private updatePlayerPosition(server: Server, roomId: string, playerId: string, newPlayerPosition: number) {
        server.to(roomId).emit('playerPositionUpdate', {
            playerId,
            newPlayerPosition,
        });
    }

    handleGameSetup(server: Server, roomId: string) {
        const gameId = this.match.rooms.get(roomId).gameId;
        const players = this.match.rooms.get(roomId).players;

        this.action.gameSetup(server, roomId, gameId, players);
    }

    handleStartTurn(data: { roomId: string; playerId: string }, server: Server, client: Socket) {
        const activeGame = this.action.activeGames.find((game) => game.roomId === data.roomId);
        const player = activeGame.playersCoord[activeGame.turn].player;

        activeGame.currentPlayerMoveBudget = parseInt(player.attributes.speed, 10);
        activeGame.currentPlayerActionPoint = 1;

        client.emit('startTurn', this.action.availablePlayerMoves(data.playerId, data.roomId));

        this.sendStartTurnLogMessage(server, data.roomId, player);
    }

    handleMove(data: { roomId: string; playerId: string; endPosition: number }, server: Server, client: Socket) {
        {
            const playerId = data.playerId;
            const roomId = data.roomId;
            const activeGame = this.action.activeGames.find((instance) => instance.roomId === roomId);
            const startPosition = activeGame.playersCoord.find((playerCoord) => playerCoord.player.id === playerId).position;

            if (this.action.isCurrentPlayersTurn(roomId, playerId)) {
                const playerPositions = this.action.movePlayer(roomId, startPosition, data.endPosition);

                const gameMap = this.action.activeGames.find((instance) => instance.roomId === roomId).game.map;
                let iceSlip = false;

                let pastPosition = startPosition;
                playerPositions.forEach((playerPosition) => {
                    if (!iceSlip) {
                        setTimeout(() => {
                            this.updatePlayerPosition(server, data.roomId, data.playerId, playerPosition);
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
    }
}
