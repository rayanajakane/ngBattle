import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, inject } from '@angular/core';
import { TilePreview } from '@app/data-structure/game-structure';
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
    @Input() isAccessible?: TilePreview = TilePreview.NONE; // Only necessary for game map

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
        this.choosePreviewClass();
    }
    setItemImage() {
        if (this.itemType) {
            this.transparentImage = `./../../../assets/${this.itemType}_transparent.png`;
        } else {
            this.transparentImage = '';
        }
    }

    setTileImage() {
        if (this.tileType) {
            this.imageUrl = `./../../../assets/${this.tileType}.jpg`;
        } else {
            this.imageUrl = './../../../assets/ground.jpg';
        }
    }

    choosePreviewClass() {
        switch (this.isAccessible) {
            case TilePreview.PREVIEW:
                return 'previsualize';
            case TilePreview.SHORTESTPATH:
                return 'shortestPath';
            default:
                return '';
        }
    }
}
