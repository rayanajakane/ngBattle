import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GameTile } from '@common/game-structure';

@Component({
    selector: 'app-tile-info-modal',
    templateUrl: './tile-info-modal.component.html',
})
export class TileInfoModalComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: { tile: GameTile }) {}
}
