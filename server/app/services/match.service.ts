import { MatchJson } from '@app/model/match-structure';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { v4 as generatePlayerID } from 'uuid';
import { GameService } from './game.service';

@Injectable()
export class MatchService {
    private gamesMap: Map<number, MatchJson> = new Map();
    private readonly floorRandomNumber: number = 1000;
    private readonly maxValueRandomNumber: number = 8999;

    constructor(@Inject() private readonly gameService: GameService) {}

    createMatch(gameId: string, adminName: string, avatar: string) {
        const adminId = generatePlayerID();
        const matchId = this.generateMatchId();
        let match: MatchJson = {
            players: [{ id: adminId, name: adminName, avatar }],
            gameId: gameId,
            adminId: adminId,
            isLocked: false,
        };
        this.gamesMap.set(matchId, match);
        return {
            status: HttpStatus.OK,
            matchId: matchId,
            adminId: adminId,
        };
    }

    async joinMatch(matchId: number, playerName: string, avatar: string) {
        const match = this.gamesMap.get(matchId);
        const playerID = generatePlayerID();
        if (!match) {
            return HttpStatus.NOT_FOUND;
        } else if (match.isLocked) {
            return {
                status: HttpStatus.FORBIDDEN,
                message: 'La partie est verouillée',
            };
        } else {
            this.gamesMap.get(matchId).players.push({ id: playerID, name: playerName, avatar });
            if (await this.isPlayersFull(match)) {
                match.isLocked = true;
            }
            return {
                status: HttpStatus.OK,
                playerId: playerID,
            };
        }
    }

    async isPlayersFull(match: MatchJson) {
        const gameMapSize = (await this.gameService.get(match.gameId)).mapSize;
        if (gameMapSize === '10' && match.players.length === 2) {
            return true;
        } else if (gameMapSize === '15' && match.players.length === 4) {
            return true;
        } else if (gameMapSize === '20' && match.players.length === 6) {
            return true;
        } else {
            return false;
        }
    }

    getAllPlayers(matchId: number) {
        const match = this.gamesMap.get(matchId);
        if (match) {
            return match.players;
        } else {
            return HttpStatus.NOT_FOUND;
        }
    }

    kickPlayer(matchId: number, adminId: string, playerId: string, reason: string) {
        const match = this.gamesMap.get(matchId);
        if (match && match.adminId === adminId) {
            const playerIndex = match.players.findIndex((player) => player.id === playerId);
            if (playerIndex !== -1) {
                match.players.splice(playerIndex, 1);
                // TODO: send a message to the kicked player and remove him from the game visually
                // send it through the body
                return HttpStatus.OK;
            } else {
                return HttpStatus.NOT_FOUND;
            }
        } else {
            return HttpStatus.FORBIDDEN;
        }
    }

    lockUnlockMatch(matchId: number, adminId: string) {
        const match = this.gamesMap.get(matchId);
        if (match && match.adminId === adminId && !this.isPlayersFull(match)) {
            match.isLocked = !match.isLocked;
        } else {
            return HttpStatus.FORBIDDEN;
        }
    }

    generateMatchId(): number {
        let randomIntInRange: number = Math.floor(this.floorRandomNumber + Math.random() * this.maxValueRandomNumber);
        while (this.gamesMap.get(randomIntInRange)) {
            randomIntInRange = Math.floor(this.floorRandomNumber + Math.random() * this.maxValueRandomNumber);
        }
        return randomIntInRange;
    }
}
