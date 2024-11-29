import { ActionService } from '@app/services/action/action.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { CombatService } from '@app/services/combat/combat.service';
import { DebugModeService } from '@app/services/debug-mode/debug-mode.service';
import { InventoryService } from '@app/services/inventory/inventory.service';
import { MatchService } from '@app/services/match.service';
import { MovementService } from '@app/services/movement/movement.service';
import { VirtualPlayerService } from '@app/services/virtual-player/virtual-player.service';
import { ItemTypes, TileTypes } from '@common/tile-types';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@Injectable()
export class ActionHandlerService {
    constructor(
        private readonly movementService: MovementService,
        private readonly action: ActionService,
        private readonly match: MatchService,
        private readonly activeGamesService: ActiveGamesService,
        private readonly inventoryService: InventoryService,
        private readonly debugModeService: DebugModeService,
        @Inject(forwardRef(() => CombatService)) private readonly combatService: CombatService,
        @Inject(forwardRef(() => VirtualPlayerService)) private readonly virtualPlayerService: VirtualPlayerService,
    ) {}

    // eslint-disable-next-line -- constants must be in SCREAMING_SNAKE_CASE
    private readonly SLIP_PERCENTAGE = 0.1;
    // eslint-disable-next-line -- constants must be in SCREAMING_SNAKE_CASE
    //TODO: move to a utils file
    private readonly TIME_BETWEEN_MOVES = 150;

    getCurrentTimeFormatted(): string {
        const currentTime = new Date();
        return currentTime.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: false }); // HH:MM:SS in EST
    }

    handleGameSetup(server: Server, roomId: string) {
        const gameId = this.match.rooms.get(roomId).gameId;
        const players = this.match.rooms.get(roomId).players;
        this.activeGamesService.gameSetup(server, roomId, gameId, players).then(() => {
            const activeGame = this.activeGamesService.getActiveGame(roomId);
            const playerCoord = activeGame.playersCoord;
            if (playerCoord[0].player.isVirtual) {
                // if the first player is a virtual player
                this.handleStartTurn({ roomId, playerId: playerCoord[0].player.id }, server, null);
            }
        });
    }

    handleStartTurn(data: { roomId: string; playerId: string }, server: Server, client: Socket) {
        const activeGame = this.activeGamesService.getActiveGame(data.roomId);
        const player = activeGame.playersCoord[activeGame.turn].player;

        activeGame.currentPlayerMoveBudget = player.attributes.speed;
        activeGame.currentPlayerActionPoint = 1;

        if (!player.isVirtual) {
            client.emit('startTurn', {
                shortestPathByTile: this.action.availablePlayerMoves(data.playerId, data.roomId),
                currentMoveBudget: activeGame.currentPlayerMoveBudget,
            });
        }
        const formattedTime = this.getCurrentTimeFormatted();
        const playerName = player.name;

        const message = `Début de tour de ${playerName}`;
        server.to(data.roomId).emit('newLog', { date: formattedTime, message, receiver: data.playerId });

        if (player.isVirtual) {
            this.virtualPlayerService.virtualPlayerId = player.id;
            this.virtualPlayerService.roomId = data.roomId;
            this.virtualPlayerService.server = server;
            this.virtualPlayerService.think();
        }
    }

    handleMove(data: { roomId: string; playerId: string; endPosition: number }, server: Server, client: Socket) {
        const playerId = data.playerId;
        const roomId = data.roomId;
        const activeGame = this.activeGamesService.getActiveGame(roomId);
        const playerCoord = activeGame.playersCoord.find((playerCoord) => playerCoord.player.id === playerId);
        const startPosition = playerCoord.position;

        if (this.action.isCurrentPlayersTurn(roomId, playerId)) {
            const playerPositions = this.action.movePlayer(roomId, startPosition, data.endPosition);

            const gameMap = activeGame.game.map;
            let iceSlip = false;
            let isItemAddedToInventory = false;

            let pastPosition = startPosition;
            let tileItem: string = '';

            // const slippingChance = this.inventoryService.getSlippingChance(player.player);
            const slippingChance = this.SLIP_PERCENTAGE;
            const isDebugMode = this.debugModeService.getDebugMode(data.roomId);

            //TODO: check necessity of this (look for equivalent condition in iterations of the foreach)
            if (!isDebugMode && gameMap[playerPositions[0]].tileType === TileTypes.ICE && Math.random() < slippingChance) {
                activeGame.currentPlayerMoveBudget = 0;
                iceSlip = true;
            }

            playerPositions.forEach((playerPosition, index) => {
                if (index !== 0 && !iceSlip && !isItemAddedToInventory) {
                    //TODO: check for a synchronous way to do this (remove set timeout)

                    this.syncDelay(this.TIME_BETWEEN_MOVES);
                    this.updatePlayerPosition(server, data.roomId, data.playerId, playerPosition);
                    if (!isDebugMode) activeGame.currentPlayerMoveBudget -= this.movementService.tileValue(gameMap[playerPosition].tileType);

                    activeGame.game.map[playerPosition].hasPlayer = true;
                    activeGame.game.map[pastPosition].hasPlayer = false;

                    activeGame.playersCoord.find((playerCoord) => playerCoord.player.id === playerId).position = playerPosition;

                    pastPosition = playerPosition;

                    tileItem = gameMap[playerPosition].item;

                    if (tileItem !== ItemTypes.EMPTY && tileItem !== ItemTypes.STARTINGPOINT) {
                        this.inventoryService.addToInventoryAndEmit(server, client, roomId, playerCoord, tileItem as ItemTypes);
                        gameMap[playerPosition].item = ItemTypes.EMPTY;
                        isItemAddedToInventory = true;
                    }

                    if (!isDebugMode && gameMap[playerPosition].tileType === TileTypes.ICE && Math.random() < slippingChance) {
                        activeGame.currentPlayerMoveBudget = 0;
                        iceSlip = true;
                    }

                    //TODO: put back the object if inventory is full
                }
            });

            if (!playerCoord.player.isVirtual) {
                client.emit('endMove', {
                    availableMoves: this.action.availablePlayerMoves(data.playerId, roomId),
                    currentMoveBudget: activeGame.currentPlayerMoveBudget,
                    hasSlipped: iceSlip,
                });
            }
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

            if (activeGame.playersCoord[activeGame.turn].player.isVirtual) {
                this.handleStartTurn({ roomId, playerId: activeGame.playersCoord[activeGame.turn].player.id }, server, null);
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

            server.to(roomId).emit('newLog', { date: this.getCurrentTimeFormatted(), message, receiver: data.playerId });
        }
    }

    handleQuitGame(server: Server, client: Socket) {
        const playerId = client.id;
        const activeGame = this.activeGamesService.getActiveGameByPlayerId(playerId);
        if (!activeGame) return;

        this.combatService.disperseKilledPlayerObjects(
            server,
            activeGame.roomId,
            activeGame.playersCoord.find((playerCoord) => playerCoord.player.id === playerId),
        );

        const roomId = activeGame.roomId;
        const playerName = activeGame.playersCoord.find((playerCoord) => playerCoord.player.id === playerId).player.name;
        const message = `${playerName} a quitté la partie`;
        server.to(roomId).emit('newLog', { date: this.getCurrentTimeFormatted(), message, receiver: playerId });

        const activePlayerId = activeGame.playersCoord[activeGame.turn].player.id;
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
            const lastManStanding = activeGame.playersCoord[0].player.name;
            const logMessage = `Partie terminée: ${lastManStanding} a gagné la partie. Joueurs restants: ${lastManStanding}`;
            server.to(roomId).emit('newLog', { date: this.getCurrentTimeFormatted(), message: logMessage });

            server.to(roomId).emit('lastManStanding');

            // remove game from server
            this.activeGamesService.removeGameInstance(roomId);
        }
    }

    private updatePlayerPosition(server: Server, roomId: string, playerId: string, newPlayerPosition: number) {
        server.to(roomId).emit('playerPositionUpdate', {
            playerId,
            newPlayerPosition,
        });
    }

    private syncDelay(ms: number) {
        const end = Date.now() + ms;
        while (Date.now() < end) continue;
    }
}
