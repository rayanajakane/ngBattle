import { Injectable } from '@angular/core';
import {
    DEFAULT_MAP_SIZE_MEDIUM,
    DEFAULT_MAP_SIZE_SMALL,
    DEFAULT_STARTING_COUNTER_FOUR,
    DEFAULT_STARTING_COUNTER_SIX,
    DEFAULT_STARTING_COUNTER_TWO,
    DEFAULT_STARTING_POINT_NUMBER,
} from '@app/services/constants';

@Injectable({
    providedIn: 'root',
})
export class DragDropService {
    startingPointNumberCounter: number = DEFAULT_STARTING_POINT_NUMBER;
    randomItemCounter: number = DEFAULT_STARTING_POINT_NUMBER;
    draggedTile: string = '';
    transparentImage: string = '';

    private mapSizeSmall: number = DEFAULT_MAP_SIZE_SMALL;
    private mapSizeMedium: number = DEFAULT_MAP_SIZE_MEDIUM;
    private startingCounterTwo: number = DEFAULT_STARTING_COUNTER_TWO;
    private startingCounterFour: number = DEFAULT_STARTING_COUNTER_FOUR;
    private startingCounterSix: number = DEFAULT_STARTING_COUNTER_SIX;

    setDraggedObject(objectType: string) {
        this.draggedTile = objectType;
    }

    resetDraggedObject() {
        this.draggedTile = '';
        this.transparentImage = '';
    }

    setMultipleItemCounter(mapSize: number) {
        let startingCounter: number;
        if (mapSize === this.mapSizeSmall) {
            startingCounter = this.startingCounterTwo;
        } else if (mapSize === this.mapSizeMedium) {
            startingCounter = this.startingCounterFour;
        } else {
            startingCounter = this.startingCounterSix;
        }
        this.startingPointNumberCounter = startingCounter;
        this.randomItemCounter = startingCounter;
    }

    reduceNumberStartingPoints() {
        if (this.startingPointNumberCounter > 0) this.startingPointNumberCounter--;
    }
    reduceNumberRandomItem() {
        if (this.randomItemCounter > 0) this.randomItemCounter--;
    }
    incrementNumberStartingPoints() {
        this.startingPointNumberCounter++;
    }
    incrementNumberRandomItem() {
        this.randomItemCounter++;
    }
}
