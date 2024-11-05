import { GameJson } from '@app/model/game-structure';
import { Injectable } from '@nestjs/common';

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
}
