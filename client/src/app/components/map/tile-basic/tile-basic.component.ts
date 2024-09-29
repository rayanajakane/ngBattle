import { Component, Input, OnChanges, inject } from '@angular/core';
import { DragDropService } from '@app/services/drag-drop.service';
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
    @Input() isToolbarTile: boolean = false; // Differentiate between toolbar tiles and map tiles
    transparentImage: string = '';
    imageUrl: string = '';
    objectName: string = '';
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

        // Empêcher le dépôt si c'est un mur ou une porte
        if (this.tileType === 'wall' || this.tileType === 'doorClosed' || this.tileType === 'doorOpen') {
            this.isDropped = false;
            return;
        }

        this.transparentImage = this.dragDropService.getTransparentImage();
        if (this.transparentImage !== '') {
            this.isDropped = true;
        }
        if (this.isToolbarTile) {
            this.isDropped = false;
            return;
        }

        if (this.dragDropService.draggedTile === 'point-depart') {
            this.dragDropService.reduceNumberRandomItem();
        }

        if (this.dragDropService.draggedTile) {
            this.dragDropService.resetDraggedObject();
        }
    }

    removeObject() {
        if (this.isDropped) {
            this.isDropped = false;
            this.objectName = '';
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
    allowDrop(event: DragEvent) {
        if (this.dragDropService.draggedTile !== '') {
            event.preventDefault();
        }
    }

    dragStart(event: DragEvent) {
        // Handle drag start logic here
        event.dataTransfer?.setData('text/plain', this.objectName);
    }

    dragEnd() {
        this.isDropped = false;
    }
}
