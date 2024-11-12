import { Injectable } from '@angular/core';
import { ShortestPathByTile } from '@common/game-structure';
import { BaseStateService } from './base-state.service';

@Injectable({
    providedIn: 'root',
})
export class MovingStateService extends BaseStateService {
    initializePrevizualisation(accessibleTiles: ShortestPathByTile): void {
        this.setAvailableTiles(Object.keys(accessibleTiles).map(Number));
        this.setShortestPathByTile(accessibleTiles);
    }

    onRightClick(index: number): void {
        console.log('You are moving', index);
    }

    onMouseDown(index: number): void {
        console.log('You are moving', index);
        this.gameController.requestMove(index);
    }

    onMouseEnter(): void {
        console.log('You are moving');
    }
}
