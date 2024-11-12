import { Injectable } from '@angular/core';
import { ShortestPathByTile } from '@common/game-structure';
import { BaseStateService } from './base-state.service';

@Injectable({
    providedIn: 'root',
})
export class CombatStateService extends BaseStateService {
    initializePrevizualisation(accessibleTiles: ShortestPathByTile | number[]): void {
        console.log('You are in combat', accessibleTiles);
    }

    onRightClick(index: number): void {
        console.log('You are in combat', index);
    }

    onMouseDown(): void {
        console.log('You are in combat');
    }

    onMouseEnter(): void {
        console.log('You are in combat');
    }
}
