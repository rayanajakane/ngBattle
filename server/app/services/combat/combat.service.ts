import { PlayerCoord } from '@common/player';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CombatService {
    startCombat(roomId: string, fighters: PlayerCoord[]): void {}
}
