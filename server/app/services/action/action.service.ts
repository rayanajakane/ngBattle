import { TileTypes } from '@app/gateways/action/action.gateway';
import { GameService } from '@app/services/game.service';
import { MovementService } from '@app/services/movement/movement.service';
import { GameStructure } from '@common/game-structure';
import { Player } from '@common/player';
import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
// TODO: declare the Coord interface interface in a separate file and import it here
export interface Coord {
    x: number;
    y: number;
    distance?: number;
    parentNodes?: Coord[];
}

export interface PlayerInfo {
    player: Player;
    position: number;
}

export enum TileType {
    Ice = 0,
    Floor = 1,
    DoorOpen = 1,
    Water = 2,
}

export interface GameInstance {
    roomId: string;
    game: GameStructure;
    playersCoord?: PlayerInfo[];
    fightParticipants?: Player[];
    fightTurns?: number;
    turn?: number;
    currentPlayerMoveBudget?: number;
    currentPlayerActionPoint?: number;
}

@Injectable()
export class ActionService {
    activeGames: GameInstance[] = [];
    turn: number = 0;
    game: GameStructure;
    activeIndex: number = 0;

    // eslint-disable-next-line -- constants must be in SCREAMING_SNAKE_CASE
    private readonly CHANCES: number = 0.5;
    constructor(
        private movement: MovementService,
        private gameService: GameService,
    ) {}

    nextTurn(roomId: string, lastTurn: boolean): void {
        const gameInstance = this.activeGames.find((instance) => instance.roomId === roomId);
        const maxTurn = gameInstance.playersCoord.length;
        const playerId = gameInstance.playersCoord[gameInstance.turn].player.id;
        let turn = gameInstance.turn;

        turn = (turn + 1) % maxTurn;

        if (lastTurn) {
            const nextPlayerId = this.activeGames[this.activeGames.findIndex((instance) => instance.roomId === roomId)].playersCoord[turn].player.id;
            this.quitGame(roomId, playerId);
            gameInstance.turn = gameInstance.playersCoord.findIndex((player) => player.player.id === nextPlayerId);
        } else {
            this.activeGames[this.activeGames.findIndex((instance) => instance.roomId === roomId)].turn = turn;
        }
    }

    async checkGameInstance(roomId: string, gameId: string): Promise<void> {
        if (this.activeGames.find((instance) => instance.roomId === roomId) === undefined) {
            const g: GameStructure = await this.gameService.get(gameId).then((game) => game);
            this.activeGames.push({ roomId, game: g });
        }
    }

    findStartingPositions(game: GameStructure): number[] {
        return game.map.map((tile, index) => (tile.item === 'startingPoint' ? index : -1)).filter((index) => index !== -1);
    }

    randomizePlayerPosition(game: GameStructure, players: Player[]): PlayerInfo[] {
        const startingPositions: number[] = this.findStartingPositions(game);
        const playerCoords: PlayerInfo[] = [];

        players.forEach((player) => {
            let randomIndex: number;
            let position: number;

            do {
                randomIndex = Math.floor(Math.random() * startingPositions.length);
                position = startingPositions[randomIndex];
                startingPositions.splice(randomIndex, 1);
            } while (playerCoords.find((playerCoord) => playerCoord.position === position) !== undefined);

            player.wins = 0;
            game.map[position].hasPlayer = true;
            playerCoords.push({ player, position });
        });

        if (startingPositions.length > 0) {
            startingPositions.forEach((position) => {
                game.map[position].item = '';
            });
        }

        return playerCoords;
    }

    gameSetup(server: Server, roomId: string, gameId: string, players: Player[]): void {
        let playerCoord: PlayerInfo[] = [];
        this.checkGameInstance(roomId, gameId).then(() => {
            const game = this.activeGames.find((instance) => instance.roomId === roomId).game as GameStructure;
            playerCoord = this.randomizePlayerPosition(game, players);
            const activeGameIndex = this.activeGames.findIndex((instance) => instance.roomId === roomId);
            playerCoord.sort((a, b) => {
                const speedA = parseInt(a.player.attributes.speed, 10);
                const speedB = parseInt(b.player.attributes.speed, 10);

                if (speedA !== speedB) {
                    return speedB - speedA;
                }
                return Math.random() - this.CHANCES;
            });
            this.activeGames[activeGameIndex].playersCoord = playerCoord;
            this.activeGames[activeGameIndex].turn = 0;
            server.to(roomId).emit('gameSetup', {
                playerCoords: playerCoord,
                turn: this.activeGames[activeGameIndex].turn,
            });
        });
    }

    movePlayer(roomId: string, startPosition: number, endPosition: number) {
        const gameInstance = this.activeGames.find((instance) => instance.roomId === roomId);
        const game: GameStructure = gameInstance.game;
        const moveBudget = gameInstance.currentPlayerMoveBudget;

        const shortestPath = this.movement.shortestPath(moveBudget, game, startPosition, endPosition);

        gameInstance.currentPlayerMoveBudget -= shortestPath.moveCost;

        return shortestPath.path;
    }

    availablePlayerMoves(playerId: string, roomId: string): { [key: number]: number[] } {
        const gameInstance = this.activeGames.find((instance) => instance.roomId === roomId);
        const game = gameInstance.game;
        const playerPosition = gameInstance.playersCoord.find((playerCoord) => playerCoord.player.id === playerId).position;

        return this.movement.availableMoves(gameInstance.currentPlayerMoveBudget, game, playerPosition);
    }

    interactWithDoor(roomId: string, playerId: string, doorPosition: number): boolean {
        const gameInstance = this.activeGames.find((instance) => instance.roomId === roomId);

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
        const gameInstance = this.activeGames.find((instance) => instance.roomId === roomId);
        const playerCoord = gameInstance.playersCoord;
        const playerIndex = playerCoord.findIndex((player) => player.player.id === playerId);

        playerCoord.splice(playerIndex, 1);
    }
}
