import { Injectable } from '@angular/core';
import { GameState, ShortestPathByTile } from '@common/game-structure';
import { BaseStateService } from './base-state.service';

@Injectable({
    providedIn: 'root',
})
export class CombatStateService extends BaseStateService {
    initializePrevisualization(accessibleTiles: ShortestPathByTile | number[]): void {
        console.log('You are in combat', accessibleTiles);
    }

    onRightClick(index: number): void {
        console.log('You are in combat', index);
    }

    onMouseDown(): GameState {
        console.log('You are in combat');
        return GameState.COMBAT;
    }

    onMouseEnter(): void {
        console.log('You are in combat');
    }
}
