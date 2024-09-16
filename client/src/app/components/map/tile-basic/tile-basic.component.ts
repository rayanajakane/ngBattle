import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-tile-basic',
  standalone: true,
  imports: [],
  templateUrl: './tile-basic.component.html',
  styleUrl: './tile-basic.component.scss'
})
export class TileBasicComponent implements OnChanges {
    @Input() tileType: string = '';

    imageUrl = '';

    constructor() {
        this.setTileImage();
    }

    ngOnChanges() {
        // Regenerate the image if the type change
        this.setTileImage();
    }

    setTileImage() {
        switch (this.tileType) {
            case "wall":
                this.imageUrl = './../../../assets/WALL.jpg';
                break;

            case "water":
                this.imageUrl = './../../../assets/WATER.jpg';
                break;

            case "ice":
                this.imageUrl = './../../../assets/ICE.jpg';
                break;

            case "doorOpen":
                this.imageUrl = './../../../assets/DOOR_OPEN.jpg';
                break;

            case "doorClosed":
                this.imageUrl = './../../../assets/DOOR_CLOSED.jpg';
                break;

            default:
                this.imageUrl = './../../../assets/GROUND.jpg';
                break;
        }
    }

}
