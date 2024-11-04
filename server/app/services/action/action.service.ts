import { GameJson } from '@app/model/game-structure';
import { GameService } from '@app/services/game.service';
import { Player } from '@app/services/match.service';
import { MovementService } from '@app/services/movement/movement.service';
import { Injectable } from '@nestjs/common';
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

enum TileType {
    Ice = 0,
    Floor = 1,
    DoorOpen = 1,
    Water = 2,
}

interface GameInstance {
    game: GameJson;
    playersCoord?: PlayerInfo[];
    turn?: number;
    currentPlayerMoveBudget?: number;
}

@Injectable()
export class ActionService {
    constructor(
        private movement: MovementService,
        private gameService: GameService,
    ) {}
    activeGames: GameInstance[] = [];
    turn: number = 0;
    game: GameJson;
    activeIndex: number = 0;

    //TODO: identify games uniquely
    private async checkGameInstance(gameId: string): Promise<void> {
        if (this.activeGames.find((instance) => instance.game.id === gameId) === undefined) {
            const game: GameJson = await this.gameService.get(gameId).then((game) => game);
            this.activeGames.push({ game });
        }
    }

    nextTurn(gameId: string): void {
        const gameInstance = this.activeGames.find((instance) => instance.game.id === gameId);
        const maxTurn = gameInstance.playersCoord.length;
        let turn = gameInstance.turn;

        turn = (turn + 1) % maxTurn;

        this.activeGames[this.activeGames.findIndex((instance) => instance.game.id === gameId)].turn = turn;
    }

    findStartingPositions(game: GameJson): number[] {
        return game.map.map((tile, index) => (tile.item === 'startingPoint' ? index : -1)).filter((index) => index !== -1);
    }

    randomizePlayerPosition(game: GameJson, players: Player[]): PlayerInfo[] {
        const startingPositions: number[] = this.findStartingPositions(game);
        const playerCoord: PlayerInfo[] = [];

        players.forEach((player) => {
            let randomIndex: number;
            let position: number;

            do {
                randomIndex = Math.floor(Math.random() * startingPositions.length);
                position = startingPositions[randomIndex];
                startingPositions.splice(randomIndex, 1);
            } while (playerCoord.find((playerCoord) => playerCoord.position === position) !== undefined);

            player.wins = 0;
            playerCoord.push({ player, position });
        });

        if (startingPositions.length > 0) {
            startingPositions.forEach((position) => {
                game.map[position].item = '';
            });
        }

        return playerCoord;
    }

    gameSetup(gameId: string, players: Player[]): PlayerInfo[] {
        let playerCoord: PlayerInfo[] = [];
        this.checkGameInstance(gameId).then(() => {
            const game = this.activeGames.find((instance) => instance.game.id === gameId).game as GameJson;
            playerCoord = this.randomizePlayerPosition(game, players);
            const activeGameIndex = this.activeGames.findIndex((instance) => instance.game.id === gameId);

            playerCoord.sort((a, b) => {
                const speedA = parseInt(a.player.attributes.speed);
                const speedB = parseInt(b.player.attributes.speed);

                if (speedA !== speedB) {
                    return speedB - speedA;
                }
                return Math.random() - 0.5;
            });

            this.activeGames[activeGameIndex].playersCoord = playerCoord;
            this.activeGames[activeGameIndex].turn = 0;
        });

        return playerCoord;
    }

    //TODO: implement socket response for client
    movePlayer(playerId: string, gameId: string, startPosition: number, endPosition: number) {
        const gameInstance = this.activeGames.find((instance) => instance.game.id === gameId);
        const game = gameInstance.game;
        const moveBudget = gameInstance.currentPlayerMoveBudget;

        const shortestPath = this.movement.shortestPath(moveBudget, game, startPosition, endPosition);
        gameInstance.currentPlayerMoveBudget -= shortestPath.moveCost;

        return shortestPath.path;
    }

    availablePlayerMoves(playerId: string, gameId: string): { [key: number]: number[] } {
        const gameInstance = this.activeGames.find((instance) => instance.game.id === gameId);
        const game = gameInstance.game;

        const playerPosition = gameInstance.playersCoord.find((playerCoord) => playerCoord.player.id === playerId).position;

        return this.movement.availableMoves(gameInstance.currentPlayerMoveBudget, game, playerPosition);
    }
}
