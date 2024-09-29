import { Injectable } from '@angular/core';
import { DEFAULT_STARTING_POINT_NUMBER } from '@app/services/constants';

@Injectable({
    providedIn: 'root',
})
export class DragDropService {
    startingPointNumberCounter: number = DEFAULT_STARTING_POINT_NUMBER;
    randomItemCounter: number = DEFAULT_STARTING_POINT_NUMBER;
    draggedTile: string = '';
    isDragging: boolean = false;
    transparentImage: string = '';

    setDraggedObject(objectType: string) {
        this.draggedTile = objectType;
        this.isDragging = true;
        //this.transparentImage = `./../../../assets/${objectType}_transparent.png`;
    }

    resetDraggedObject() {
        this.draggedTile = '';
        this.isDragging = false;
        this.transparentImage = '';
    }

    setMultipleItemCounter(mapSize: number) {
        let startingCounter: number;
        if (mapSize == 10) {
            startingCounter = 2;
        } else if (mapSize == 15) {
            startingCounter = 4;
        } else {
            startingCounter = 6;
        }
        this.startingPointNumberCounter = startingCounter;
        this.randomItemCounter = startingCounter + 4;
    }

    reduceNumberStartingPoints() {
        if (this.startingPointNumberCounter > 0) this.startingPointNumberCounter--;
    }

    reduceNumberRandomItem() {
        if (this.randomItemCounter > 0) this.randomItemCounter--;
    }
    addNumberStartingPoints() { this.startingPointNumberCounter++; }

    addNumberRandomItem() { this.randomItemCounter++; }
    // resetNumberRandomItem() {
    //     this.startingPointNumberCounter = DEFAULT_STARTING_POINT_NUMBER;
    // }

    getTransparentImage(): string {
        return this.transparentImage;
    }
}
