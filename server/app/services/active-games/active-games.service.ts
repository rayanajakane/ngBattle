import { GameInstance } from '@app/data-structures/game-instance';
import { GameService } from '@app/services/game.service';
import { GameStructure } from '@common/game-structure';
import { Player, PlayerCoord } from '@common/player';
import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { CombatTimerService } from '../combat-timer/combat-timer.service';
import { TimerService } from '../timer/timer.service';

@Injectable()
export class ActiveGamesService {
    constructor(private readonly gameService: GameService) {}
    activeGames: GameInstance[] = [];
    private readonly CHANCES: number = 0.5;

    findStartingPositions(game: GameStructure): number[] {
        return game.map.map((tile, index) => (tile.item === 'startingPoint' ? index : -1)).filter((index) => index !== -1);
    }

    randomizePlayerPosition(game: GameStructure, players: Player[]): PlayerCoord[] {
        const startingPositions: number[] = this.findStartingPositions(game);
        const playerCoords: PlayerCoord[] = [];

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

    async checkGameInstance(roomId: string, gameId: string): Promise<void> {
        if (this.activeGames.find((instance) => instance.roomId === roomId) === undefined) {
            const g: GameStructure = await this.gameService.get(gameId).then((game) => game);
            const deepCopyGame = JSON.parse(JSON.stringify(g));
            this.activeGames.push({ roomId, game: deepCopyGame });
        }
    }

    gameSetup(server: Server, roomId: string, gameId: string, players: Player[]): Promise<void> {
        return new Promise((resolve, reject) => {
            let playerCoord: PlayerCoord[] = [];
            this.checkGameInstance(roomId, gameId)
                .then(() => {
                    const game = this.activeGames.find((instance) => instance.roomId === roomId).game as GameStructure;
                    playerCoord = this.randomizePlayerPosition(game, players);
                    const activeGameIndex = this.activeGames.findIndex((instance) => instance.roomId === roomId);
                    playerCoord.sort((a, b) => {
                        const speedA = parseInt(a.player.attributes.speed, 10);
                        const speedB = parseInt(b.player.attributes.speed, 10);

                        // used when player is killed and has to respawn back home
                        a.player.homePosition = a.position;
                        b.player.homePosition = b.position;

                        if (speedA !== speedB) {
                            return speedB - speedA;
                        }
                        return Math.random() - this.CHANCES;
                    });
                    this.activeGames[activeGameIndex].playersCoord = playerCoord;
                    this.activeGames[activeGameIndex].turn = 0;
                    this.activeGames[activeGameIndex].turnTimer = new TimerService(server, roomId);
                    this.activeGames[activeGameIndex].combatTimer = new CombatTimerService(server, roomId);

                    this.activeGames[activeGameIndex].turnTimer.startTimer();

                    server.to(roomId).emit('gameSetup', {
                        playerCoords: playerCoord,
                        turn: this.activeGames[activeGameIndex].turn,
                    });

                    resolve();
                })
                .catch(reject);
        });
    }

    getActiveGame(roomId: string): GameInstance {
        return this.activeGames.find((instance) => instance.roomId === roomId);
    }
}
