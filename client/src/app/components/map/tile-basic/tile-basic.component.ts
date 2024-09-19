import { Component, Input, OnChanges } from '@angular/core';
import { TileTypes } from '@app/data-structure/tileType';

@Component({
    selector: 'app-tile-basic',
    standalone: true,
    imports: [],
    templateUrl: './tile-basic.component.html',
    styleUrl: './tile-basic.component.scss',
})
export class TileBasicComponent implements OnChanges {
    @Input() tileType: string = TileTypes.BASIC;
    imageUrl: string = '';
    constructor() {
        this.setTileImage();
    }

    ngOnChanges() {
        // Regenerate the image if the type change
        this.setTileImage();
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
