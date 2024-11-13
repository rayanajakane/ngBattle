import { Injectable } from '@angular/core';
import { GameState } from '@common/game-structure';
import { BaseStateService } from './base-state.service';

@Injectable({
    providedIn: 'root',
})
export class ActionStateService extends BaseStateService {
    initializePrevisualization(accessibleTiles: number[]): void {
        this.setAvailableTiles(accessibleTiles);
    }

    onRightClick(index: number): void {
        console.log('You are doing action', index);
    }

    onMouseDown(index: number): GameState {
        if (this.availablesTilesIncludes(index)) {
            this.gameController.requestAction(index);
            return GameState.NOTPLAYING;
        }
        return GameState.MOVING;
    }

    onMouseEnter(): void {
        console.log('You are doing action');
    }
}
