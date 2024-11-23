import { ActionService } from '@app/services/action/action.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { MatchService } from '@app/services/match.service';
import { TileTypes } from '@common/tile-types';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { CombatService } from '../combat/combat.service';
@Injectable()
export class ActionHandlerService {
    constructor(
        private readonly action: ActionService,
        private readonly match: MatchService,
        private readonly activeGamesService: ActiveGamesService,
        private readonly combatService: CombatService,
    ) {}

    // eslint-disable-next-line -- constants must be in SCREAMING_SNAKE_CASE
    private readonly TEN_POURCENT = 0.1;
    // eslint-disable-next-line -- constants must be in SCREAMING_SNAKE_CASE
    private readonly TIME_BETWEEN_MOVES = 150;

    getCurrentTimeFormatted(): string {
        const currentTime = new Date();
        return currentTime.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: false }); // HH:MM:SS in EST
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
        this.activeGamesService.gameSetup(server, roomId, gameId, players);
    }

    handleStartTurn(data: { roomId: string; playerId: string }, server: Server, client: Socket) {
        const activeGame = this.activeGamesService.getActiveGame(data.roomId);
        const player = activeGame.playersCoord[activeGame.turn].player;

        activeGame.currentPlayerMoveBudget = parseInt(player.attributes.speed, 10);
        activeGame.currentPlayerActionPoint = 1;

        client.emit('startTurn', {
            shortestPathByTile: this.action.availablePlayerMoves(data.playerId, data.roomId),
            currentMoveBudget: activeGame.currentPlayerMoveBudget,
        });

        const formattedTime = this.getCurrentTimeFormatted();
        const playerName = player.name;

        const message = `Début de tour de ${playerName}`;
        server.to(data.roomId).emit('newLog', { date: formattedTime, message, receiver: data.playerId });
    }

    handleGetAvailableMovesOnBudget(data: { roomId: string; playerId: string; currentBudget: number }, client: Socket) {
        client.emit('availableMovesOnBudget', this.action.availablePlayerMovesOnBudget(data.playerId, data.roomId, data.currentBudget));
    }

    handleMove(data: { roomId: string; playerId: string; endPosition: number }, server: Server, client: Socket) {
        const playerId = data.playerId;
        const roomId = data.roomId;
        const activeGame = this.activeGamesService.getActiveGame(roomId);
        const startPosition = activeGame.playersCoord.find((playerCoord) => playerCoord.player.id === playerId).position;

        if (this.action.isCurrentPlayersTurn(roomId, playerId)) {
            const playerPositions = this.action.movePlayer(roomId, startPosition, data.endPosition);

            const gameMap = activeGame.game.map;
            let iceSlip = false;

            let pastPosition = startPosition;
            let tileCounter = 0;
            playerPositions.forEach((playerPosition) => {
                if (!iceSlip) {
                    setTimeout(() => {
                        this.updatePlayerPosition(server, data.roomId, data.playerId, playerPosition);
                    }, this.TIME_BETWEEN_MOVES);

                    activeGame.game.map[playerPosition].hasPlayer = true;
                    activeGame.game.map[pastPosition].hasPlayer = false;

                    activeGame.playersCoord.find((playerCoord) => playerCoord.player.id === playerId).position = playerPosition;

                    pastPosition = playerPosition;
                    tileCounter++;

                    if (gameMap[playerPosition].tileType === TileTypes.ICE && Math.random() < this.TEN_POURCENT) {
                        activeGame.currentPlayerMoveBudget = 0;
                        iceSlip = true;
                    }
                }
            });

            setTimeout(() => {
                client.emit('endMove', {
                    availableMoves: this.action.availablePlayerMoves(data.playerId, roomId),
                    currentMoveBudget: activeGame.currentPlayerMoveBudget,
                    hasSlipped: iceSlip,
                });
            }, this.TIME_BETWEEN_MOVES * tileCounter);
        }
    }

    handleEndTurn(data: { roomId: string; playerId: string; lastTurn: boolean }, server: Server) {
        const roomId = data.roomId;
        const activeGame = this.activeGamesService.getActiveGame(roomId);

        activeGame.turnTimer.resetTimer();
        activeGame.turnTimer.startTimer();

        if (this.action.isCurrentPlayersTurn(roomId, data.playerId)) {
            this.action.nextTurn(roomId, data.lastTurn);

            if (activeGame.playersCoord.length > 0) {
                server.to(roomId).emit('endTurn', activeGame.playersCoord[activeGame.turn].player.id);
            }
        }
    }

    handleInteractDoor(data: { roomId: string; playerId: string; doorPosition: number }, server: Server, client: Socket) {
        const roomId = data.roomId;
        const doorPosition = data.doorPosition;
        const activeGame = this.activeGamesService.getActiveGame(roomId);

        const remainingActionPoints = activeGame.currentPlayerActionPoint;
        const map = activeGame.game.map;

        if (remainingActionPoints > 0) {
            const isToggable = this.action.interactWithDoor(roomId, data.playerId, data.doorPosition);
            server.to(roomId).emit('interactDoor', {
                isToggable,
                doorPosition,
                availableMoves: this.action.availablePlayerMoves(data.playerId, roomId),
            });

            const playerName = this.activeGamesService
                .getActiveGame(roomId)
                .playersCoord.find((playerCoord) => playerCoord.player.id === data.playerId).player.name;

            let message = '';
            if (map[doorPosition].tileType === TileTypes.DOOROPEN) {
                message = `Porte a été ouverte par ${playerName}`;
            } else if (map[doorPosition].tileType === TileTypes.DOORCLOSED) {
                message = `Porte a été ouverte par ${playerName}`;
            }

            client.emit('newLog', { date: this.getCurrentTimeFormatted(), message, receiver: data.playerId });
        }
    }

    handleQuitGame(server: Server, client: Socket) {
        const playerId = client.id;
        const activeGame = this.activeGamesService.getActiveGameByPlayerId(playerId);
        if (!activeGame) return;

        const roomId = activeGame.roomId;
        const playerName = activeGame.playersCoord.find((playerCoord) => playerCoord.player.id === playerId).player.name;
        const message = `${playerName} a quitté la partie`;
        server.to(roomId).emit('newLog', { date: this.getCurrentTimeFormatted(), message, receiver: playerId });

        const activePlayerId = activeGame.playersCoord[activeGame.turn].player.id;
        const killedPlayer = activeGame.playersCoord.find((playerCoord) => playerCoord.player.id === playerId);
        if (this.combatService.fightersMap.get(roomId)) {
            const fighters = this.combatService.fightersMap.get(roomId);
            fighters.forEach((fighter) => {
                if (fighter.player.id === playerId) {
                    this.combatService.killPlayer(roomId, fighter, server);
                }
            });
        }

        if (activePlayerId === playerId) {
            this.handleEndTurn({ roomId, playerId, lastTurn: true }, server);
        } else {
            this.action.quitGame(roomId, playerId);
        }

        server.to(roomId).emit('quitGame', playerId);

        if (activeGame.playersCoord.length === 1) {
            server.to(roomId).emit('lastManStanding');
            // remove game from server
            this.activeGamesService.removeGameInstance(roomId);
        }
    }
}
