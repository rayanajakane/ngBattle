import { TileTypes } from '@app/gateways/action/action.gateway';
import { GameJson } from '@app/model/game-structure';
import { CombatService } from '@app/services/combat/combat.service';
import { GameService } from '@app/services/game.service';
import { Player } from '@app/services/match.service';
import { MovementService } from '@app/services/movement/movement.service';
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

enum TileType {
    Ice = 0,
    Floor = 1,
    DoorOpen = 1,
    Water = 2,
}

interface GameInstance {
    roomId: string;
    game: GameJson;
    playersCoord?: PlayerInfo[];
    turn?: number;
    currentPlayerMoveBudget?: number;
    currentPlayerActionPoint?: number;
}

@Injectable()
export class ActionService {
    constructor(
        private movement: MovementService,
        private gameService: GameService,
        private combat: CombatService,
    ) {}
    activeGames: GameInstance[] = [];
    turn: number = 0;
    game: GameJson;
    activeIndex: number = 0;

    nextTurn(roomId: string): void {
        const gameInstance = this.activeGames.find((instance) => instance.roomId === roomId);
        const maxTurn = gameInstance.playersCoord.length;
        let turn = gameInstance.turn;

        turn = (turn + 1) % maxTurn;

        this.activeGames[this.activeGames.findIndex((instance) => instance.roomId === roomId)].turn = turn;
    }

    //TODO: identify games uniquely
    private async checkGameInstance(roomId: string, gameId: string): Promise<void> {
        //TODO: check condition

        if (this.activeGames.find((instance) => instance.roomId === roomId) === undefined) {
            const game: GameJson = await this.gameService.get(gameId).then((game) => game);
            this.activeGames.push({ roomId, game });
        }
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

            //TODO: refacor this for simpler version
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

    gameSetup(server: Server, roomId: string, gameId: string, players: Player[]): void {
        let playerCoord: PlayerInfo[] = [];
        this.checkGameInstance(roomId, gameId).then(() => {
            const game = this.activeGames.find((instance) => instance.roomId === roomId).game as GameJson;
            playerCoord = this.randomizePlayerPosition(game, players);
            const activeGameIndex = this.activeGames.findIndex((instance) => instance.roomId === roomId);
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
            console.log(playerCoord);
            server.to(roomId).emit('gameSetup', {
                playerCoords: playerCoord,
                turn: this.activeGames[activeGameIndex].turn,
            });
        });
    }

    //TODO: implement socket response for client
    movePlayer(roomId: string, startPosition: number, endPosition: number) {
        const gameInstance = this.activeGames.find((instance) => instance.roomId === roomId);
        const game = gameInstance.game;
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

    interactWithDoor(roomId: string, playerId: string, doorPosition: number) {
        const gameInstance = this.activeGames.find((instance) => instance.roomId === roomId);

        const game = gameInstance.game;
        const mapSize = parseInt(game.mapSize);

        const playerPosition = gameInstance.playersCoord.find((playerCoord) => playerCoord.player.id === playerId).position;
        const door = game.map[doorPosition].tileType;

        if (
            playerPosition === doorPosition + 1 ||
            playerPosition === doorPosition - 1 ||
            playerPosition === doorPosition + mapSize ||
            playerPosition === doorPosition - mapSize
        ) {
            return;
        }

        if (door === TileTypes.DOOROPEN) {
            game.map[doorPosition].tileType = TileTypes.DOORCLOSED;
        } else {
            game.map[doorPosition].tileType = TileTypes.DOOROPEN;
        }

        gameInstance.currentPlayerActionPoint -= 1;
    }

    startCombat(roomId: string, playerId: string, targetId: string) {
        const gameInstance = this.activeGames.find((instance) => instance.roomId === roomId);
        const game = gameInstance.game;

        const playerPosition = gameInstance.playersCoord.find((playerCoord) => playerCoord.player.id === playerId).position;
        const targetPosition = gameInstance.playersCoord.find((playerCoord) => playerCoord.player.id === targetId).position;

        if (this.combat.isValidCombatPosition(game, playerPosition, targetPosition)) {
            // this.combat.Combat(game, playerId, targetId);
        }
    }
}
