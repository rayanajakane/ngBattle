import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TileInfoModalComponent } from '@app/components/tile-info-modal/tile-info-modal.component';
import { GameState, GameTile, ShortestPathByTile } from '@common/game-structure';
import { BaseStateService } from './base-state.service';

@Injectable({
    providedIn: 'root',
})
export class MovingStateService extends BaseStateService {
    constructor(protected dialog: MatDialog) {
        super(dialog);
    }

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

    onRightClick(tile: GameTile): void {
        if (this.gameController.isActivePlayer()) {
            if (this.gameController.isDebugModeActive) {
                this.resetMovementPrevisualization();
                this.gameController.requestMove(tile.idx);
            } else {
                this.dialog.open(TileInfoModalComponent, {
                    data: { tile },
                });
            }
        }
    }
}
