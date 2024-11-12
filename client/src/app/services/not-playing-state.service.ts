import { Injectable } from '@angular/core';
import { ShortestPathByTile } from '@common/game-structure';
import { BaseStateService } from './base-state.service';

@Injectable({
    providedIn: 'root',
})
export class NotPlayingStateService extends BaseStateService {
    initializePrevizualisation(accessibleTiles: ShortestPathByTile | number[]): void {
        console.log('You are doing nothing', accessibleTiles);
    }

    onRightClick(index: number): void {
        console.log('You are doing nothing', index);
    }

    onMouseDown(): void {
        console.log('You are doing nothing');
    }

    onMouseEnter(): void {
        console.log('You are doing nothing');
    }
}
