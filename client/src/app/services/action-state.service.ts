import { Injectable } from '@angular/core';
import { ShortestPathByTile } from '@common/game-structure';
import { BaseStateService } from './base-state.service';

@Injectable({
    providedIn: 'root',
})
export class ActionStateService extends BaseStateService {
    initializePrevizualisation(accessibleTiles: ShortestPathByTile | number[]): void {
        console.log('You are doing action', accessibleTiles);
    }

    onRightClick(index: number): void {
        console.log('You are doing action', index);
    }

    onMouseDown(index: number): void {
        if (this.availableTiles.includes(index)) {
            this.gameController.requestAction(index);
        }
    }

    onMouseEnter(): void {
        console.log('You are doing action');
    }
}
