import { Injectable } from '@angular/core';
import { GameState, ShortestPathByTile } from '@common/game-structure';
import { BaseStateService } from './base-state.service';

@Injectable({
    providedIn: 'root',
})
export class NotPlayingStateService extends BaseStateService {
    initializePrevisualization(accessibleTiles: ShortestPathByTile | number[]): void {
        console.log('You are doing nothing', accessibleTiles);
    }

    onRightClick(index: number): void {
        console.log('You are doing nothing', index);
    }

    onMouseDown(): GameState {
        console.log('You are doing nothing');
        return GameState.NOTPLAYING;
    }

    onMouseEnter(): void {
        console.log('You are doing nothing');
    }
}
