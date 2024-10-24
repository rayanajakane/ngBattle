import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, inject } from '@angular/core';
import { TileTypes } from '@app/data-structure/toolType';
import { DragDropService } from '@app/services/drag-drop.service';
@Component({
    selector: 'app-tile-basic',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './tile-basic.component.html',
    styleUrl: './tile-basic.component.scss',
})
export class TileBasicComponent implements OnChanges {
    @Input() tileType: string = TileTypes.BASIC;
    @Input() isToolbarTile: boolean = false; // Differentiate between toolbar tiles and map tiles
    @Input() itemType: string = '';

    transparentImage: string = '';
    imageUrl: string = '';

    dragDropService = inject(DragDropService);
    isDropped: boolean = false;

    constructor() {
        this.setTileImage();
    }

    ngOnChanges() {
        this.setTileImage();
        this.setItemImage();
    }
    setItemImage() {
        if (this.itemType) {
            this.transparentImage = `src/assets/${this.itemType}_transparent.png`;
        } else {
            this.transparentImage = '';
        }
    }

    setTileImage() {
        if (this.tileType) {
            this.imageUrl = `src/assets/${this.tileType}.jpg`;
        } else {
            this.imageUrl = 'src/assets/ground.jpg';
        }
    }
}
