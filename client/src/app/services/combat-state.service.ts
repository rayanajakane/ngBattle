import { Injectable } from '@angular/core';
import { GameState } from '@common/game-structure';
import { BaseStateService } from './base-state.service';

@Injectable({
    providedIn: 'root',
})
export class CombatStateService extends BaseStateService {
    onMouseDown(): GameState {
        return GameState.COMBAT;
    }
}
