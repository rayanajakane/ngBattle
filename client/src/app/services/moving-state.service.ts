import { Injectable } from '@angular/core';
import { GameState, ShortestPathByTile } from '@common/game-structure';
import { BaseStateService } from './base-state.service';

@Injectable({
    providedIn: 'root',
})
export class MovingStateService extends BaseStateService {
    initializePrevisualization(accessibleTiles: ShortestPathByTile): void {
        this.setAvailableTiles(Object.keys(accessibleTiles).map(Number));
        this.setShortestPathByTile(accessibleTiles);
    }

    onMouseDown(index: number): GameState {
        if (this.availablesTilesIncludes(index)) {
            this.resetMovementPrevisualization();
            this.gameController.requestMove(index);
            return GameState.NOTPLAYING;
        }
        return GameState.MOVING;
    }
}
