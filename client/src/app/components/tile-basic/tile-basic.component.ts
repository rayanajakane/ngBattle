import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, inject } from '@angular/core';
import { DragDropService } from '@app/services/drag-drop.service';
import { TilePreview } from '@common/game-structure';
import { TileTypes } from '@common/tile-types';

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
    @Input() avatar?: string = '';

    transparentImage: string = '';
    imageUrl: string = '';
    avatarUrl: string = '';

    dragDropService = inject(DragDropService);
    isDropped: boolean = false;

    constructor() {
        this.setTileImage();
    }

    ngOnChanges() {
        this.setTileImage();
        this.setItemImage();
        this.choosePreviewClass();
        this.setAvatarImage();
    }
    setItemImage() {
        if (this.itemType) {
            this.transparentImage = `./assets/${this.itemType}_transparent.png`;
        } else {
            this.transparentImage = '';
        }
    }

    setTileImage() {
        if (this.tileType) {
            this.imageUrl = `./assets/${this.tileType}.jpg`;
        } else {
            this.imageUrl = './assets/ground.jpg';
        }
    }

    setAvatarImage() {
        if (this.avatar) {
            this.avatarUrl = `./../../../assets/characters/${this.avatar}.png`;
        } else {
            this.avatarUrl = '';
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
