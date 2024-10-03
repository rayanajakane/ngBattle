import { MatchJson } from '@app/model/match-structure';
import { HttpStatus, Injectable } from '@nestjs/common';
import { v4 as generatePlayerID } from 'uuid';

@Injectable()
export class MatchService {
    private gamesMap: Map<number, MatchJson> = new Map();
    private readonly floorRandomNumber: number = 1000;
    private readonly maxValueRandomNumber: number = 8999;

    constructor() {}

    createMatch(gameId: string) {
        const adminId = generatePlayerID();
        const matchId = this.generateMatchId();
        let match: MatchJson = {
            players: [adminId],
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

    joinMatch(matchId: number) {
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
            this.gamesMap.get(matchId).players.push(playerID);
            return {
                status: HttpStatus.OK,
                playerId: playerID,
            };
        }
    }

    kickPlayer(matchId: number, adminId: string, playerId: string, reason: string) {
        const match = this.gamesMap.get(matchId);
        if (match && match.adminId === adminId) {
            const playerIndex = match.players.indexOf(playerId);
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
        if (match && match.adminId === adminId) {
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
