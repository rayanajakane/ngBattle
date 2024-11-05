import { GameJson } from '@app/model/game-structure';
import { Player } from '@app/services/match.service';
import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
@Injectable()
export class CombatService {
    constructor() {}

    isValidCombatPosition(game: GameJson, attackerPosition: number, defenderPosition: number): boolean {
        const mapSize: number = parseInt(game.mapSize);

        if (
            attackerPosition === defenderPosition + 1 ||
            attackerPosition === defenderPosition - 1 ||
            attackerPosition === defenderPosition + mapSize ||
            attackerPosition === defenderPosition - mapSize
        ) {
            return true;
        }

        return false;
    }

    fight(server: Server, roomId: string, attacker: Player, defender: Player): void {}
}
