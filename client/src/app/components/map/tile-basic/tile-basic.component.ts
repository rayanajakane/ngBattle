import { Component, Input, OnChanges, inject } from '@angular/core';
import { DragDropService } from '@app/services/drag-drop.service';
@Component({
    selector: 'app-tile-basic',
    standalone: true,
    imports: [],
    templateUrl: './tile-basic.component.html',
    styleUrl: './tile-basic.component.scss',
})
export class TileBasicComponent implements OnChanges {
    @Input() tileType: string = '';
    transparentImage: string = '';
    imageUrl: string = '';
    dragDropService = inject(DragDropService);
    isDropped: boolean = false;

    constructor() {
        this.setTileImage();
    }

    ngOnChanges() {
        this.setTileImage();
    }

    dropObject() {
        if (this.dragDropService.draggedTile === 'point-depart' && this.dragDropService.startingPointNumber === 0) {
            this.isDropped = false;
            return;
        }

        this.transparentImage = this.dragDropService.getTransparentImage();
        if (this.transparentImage !== '') {
            this.isDropped = true;
        }

        if (this.dragDropService.draggedTile === 'point-depart') {
            this.dragDropService.reduceNumberRandomItem();
        }

        if (this.dragDropService.draggedTile) {
            this.dragDropService.resetDraggedObject();
        }
    }

    setTileImage() {
        switch (this.tileType) {
            case 'wall':
                this.imageUrl = './../../../assets/WALL.jpg';
                break;

            case 'water':
                this.imageUrl = './../../../assets/WATER.jpg';
                break;

            case 'ice':
                this.imageUrl = './../../../assets/ICE.jpg';
                break;

            case 'doorOpen':
                this.imageUrl = './../../../assets/DOOR_OPEN.jpg';
                break;

            case 'doorClosed':
                this.imageUrl = './../../../assets/DOOR_CLOSED.jpg';
                break;

            default:
                this.imageUrl = './../../../assets/GROUND.jpg';
                break;
        }
    }
}
