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

export interface PlayerCoord {
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
    players?: Player[];
    turn?: number;
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

    // placeholder for now
    playermoveSpeed = 3;

    async checkGameInstance(gameId: string): Promise<void> {
        if (this.activeGames.find((instance) => instance.game.id === gameId) === undefined) {
            const fetchedGame: GameJson = await this.gameService.get(gameId).then((game) => game);
            this.activeGames.push({ game: fetchedGame });
        }
    }

    findStartingPositions(game: GameJson): number[] {
        return game.map.map((tile, index) => (tile.item === 'startingPoint' ? index : -1)).filter((index) => index !== -1);
    }

    nextTurn(gameId: string): void {
        const gameInstance = this.activeGames.find((instance) => instance.game.id === gameId);
        const maxTurn = gameInstance.players.length;
        let turn = gameInstance.turn;

        turn = (turn + 1) % maxTurn;

        this.activeGames[this.activeGames.findIndex((instance) => instance.game.id === gameId)].turn = turn;
    }

    randomizePlayerPosition(game: GameJson, players: Player[]): PlayerCoord[] {
        const startingPositions: number[] = this.findStartingPositions(game);
        const playerCoord: PlayerCoord[] = [];
        players.forEach((player) => {
            let randomIndex: number;
            let position: number;

            do {
                randomIndex = Math.floor(Math.random() * startingPositions.length);
            } while (playerCoord.find((playerCoord) => playerCoord.position === (position = startingPositions[randomIndex])) !== undefined);

            playerCoord.push({ player, position });
        });
        return playerCoord;
    }

    gameSetup(gameId: string, players: Player[]): PlayerCoord[] {
        let playerCoord: PlayerCoord[] = [];
        this.checkGameInstance(gameId).then(() => {
            const game = this.activeGames.find((instance) => instance.game.id === gameId).game as GameJson;
            playerCoord = this.randomizePlayerPosition(game, players);
            this.activeGames.push({ game, players, turn: 0 });
        });

        return playerCoord;
    }

    //TODO: implement socket response for client
    movePlayer(playerId: string, gameId: string, startPosition: number, endPosition: number) {
        const gameInstance = this.activeGames.find((instance) => instance.game.id === gameId);
        const game = gameInstance.game;
        const player = gameInstance.players.find((player) => player.id === playerId);

        this.movement.shortestPath(player, game, startPosition, endPosition);
    }

    availablePlayerMoves(playerId: string, gameId: string, startPosition: number, endPosition: number) {
        const gameInstance = this.activeGames.find((instance) => instance.game.id === gameId);
        const game = gameInstance.game;
        const player = gameInstance.players.find((player) => player.id === playerId);

        this.movement.availableMoves(player, game, startPosition);
    }
}
