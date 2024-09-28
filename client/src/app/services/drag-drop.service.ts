import { Injectable } from '@angular/core';
import { DEFAULT_STARTING_POINT_NUMBER } from '@app/services/constants-service';

@Injectable({
    providedIn: 'root',
})
export class DragDropService {
    startingPointNumber: number = DEFAULT_STARTING_POINT_NUMBER;
    draggedTile: string = '';
    isDragging: boolean = false;
    transparentImage: string = '';

    setDraggedObject(objectType: string) {
        this.draggedTile = objectType;
        this.isDragging = true;
        this.transparentImage = `./../../../assets/${objectType}_transparent.png`; // Définir l'image transparente
    }

    resetDraggedObject() {
        this.draggedTile = '';
        this.isDragging = false;
        this.transparentImage = '';
    }

    reduceNumberRandomItem() {
        if (this.startingPointNumber > 0) this.startingPointNumber--;
    }

    resetNumberRandomItem() {
        this.startingPointNumber = DEFAULT_STARTING_POINT_NUMBER;
    }

    getTransparentImage(): string {
        return this.transparentImage;
    }
}
