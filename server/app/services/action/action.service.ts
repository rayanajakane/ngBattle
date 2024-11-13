import { MovementService } from '@app/services/movement/movement.service';
import { GameStructure } from '@common/game-structure';
import { TileTypes } from '@common/tile-types';
import { Injectable } from '@nestjs/common';
import { ActiveGamesService } from '../active-games/active-games.service';

// TODO: declare the Coord interface interface in a separate file and import it here

@Injectable()
export class ActionService {
    // eslint-disable-next-line -- constants must be in SCREAMING_SNAKE_CASE
    private readonly CHANCES: number = 0.5;
    constructor(
        private readonly movement: MovementService,
        private readonly activeGamesService: ActiveGamesService,
    ) {}

    nextTurn(roomId: string, lastTurn: boolean): void {
        const gameInstance = this.activeGamesService.getActiveGame(roomId);
        const maxTurn = gameInstance.playersCoord.length;
        const playerId = gameInstance.playersCoord[gameInstance.turn].player.id;
        let turn = gameInstance.turn;

        turn = (turn + 1) % maxTurn;

        if (lastTurn) {
            const nextPlayerId = gameInstance.playersCoord[turn].player.id;
            this.quitGame(roomId, playerId);
            gameInstance.turn = gameInstance.playersCoord.findIndex((player) => player.player.id === nextPlayerId);
        } else {
            gameInstance.turn = turn;
        }
    }

    isCurrentPlayersTurn(roomId: string, playerId: string): boolean {
        const gameInstance = this.activeGamesService.getActiveGame(roomId);
        const currentPlayer = gameInstance.playersCoord[gameInstance.turn].player;

        return currentPlayer.id === playerId;
    }

    movePlayer(roomId: string, startPosition: number, endPosition: number) {
        const gameInstance = this.activeGamesService.getActiveGame(roomId);
        const game: GameStructure = gameInstance.game;
        const moveBudget = gameInstance.currentPlayerMoveBudget;

        const shortestPath = this.movement.shortestPath(moveBudget, game, startPosition, endPosition);

        gameInstance.currentPlayerMoveBudget -= shortestPath.moveCost;

        return shortestPath.path;
    }

    availablePlayerMoves(playerId: string, roomId: string): { [key: number]: number[] } {
        const gameInstance = this.activeGamesService.getActiveGame(roomId);
        const game = gameInstance.game;
        const playerPosition = gameInstance.playersCoord.find((playerCoord) => playerCoord.player.id === playerId).position;

        return this.movement.availableMoves(gameInstance.currentPlayerMoveBudget, game, playerPosition);
    }

    interactWithDoor(roomId: string, playerId: string, doorPosition: number): boolean {
        const gameInstance = this.activeGamesService.getActiveGame(roomId);

        const game = gameInstance.game;
        const mapSize = parseInt(game.mapSize, 10);

        const playerPosition = gameInstance.playersCoord.find((playerCoord) => playerCoord.player.id === playerId).position;
        const door = game.map[doorPosition].tileType;

        if (
            playerPosition === doorPosition + 1 ||
            playerPosition === doorPosition - 1 ||
            playerPosition === doorPosition + mapSize ||
            playerPosition === doorPosition - mapSize
        ) {
            if (door === TileTypes.DOOROPEN) {
                game.map[doorPosition].tileType = TileTypes.DOORCLOSED;
            } else {
                game.map[doorPosition].tileType = TileTypes.DOOROPEN;
            }

            gameInstance.currentPlayerActionPoint -= 1;
            return true;
        }
        return false;
    }

    quitGame(roomId: string, playerId: string) {
        const gameInstance = this.activeGamesService.getActiveGame(roomId);
        const playerCoord = gameInstance.playersCoord;
        const playerIndex = playerCoord.findIndex((player) => player.player.id === playerId);
        const playerPosition = playerCoord.find((player) => player.player.id === playerId).position;
        gameInstance.game.map[playerPosition].hasPlayer = false;

        playerCoord.splice(playerIndex, 1);
    }
}
