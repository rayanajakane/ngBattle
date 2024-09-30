import { Component, Input, OnChanges, inject } from '@angular/core';
import { TileTypes } from '@app/data-structure/toolType';
import { DragDropService } from '@app/services/drag-drop.service';
@Component({
    selector: 'app-tile-basic',
    standalone: true,
    imports: [],
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
            this.transparentImage = `./../../../assets/${this.itemType}_transparent.png`;
        } else {
            this.transparentImage = '';
        }
    }

    setTileImage() {
        switch (this.tileType) {
            case TileTypes.WALL:
                this.imageUrl = './../../../assets/WALL.jpg';
                break;

            case TileTypes.WATER:
                this.imageUrl = './../../../assets/WATER.jpg';
                break;

            case TileTypes.ICE:
                this.imageUrl = './../../../assets/ICE.jpg';
                break;

            case TileTypes.DOOROPEN:
                this.imageUrl = './../../../assets/DOOR_OPEN.jpg';
                break;

            case TileTypes.DOORCLOSED:
                this.imageUrl = './../../../assets/DOOR_CLOSED.jpg';
                break;

            default:
                this.imageUrl = './../../../assets/GROUND.jpg';
                break;
        }
    }
}
