import { Injectable } from '@angular/core';
import {
    DEFAULT_MAP_SIZE_MEDIUM,
    DEFAULT_MAP_SIZE_SMALL,
    DEFAULT_STARTING_COUNTER_FOUR,
    DEFAULT_STARTING_COUNTER_SIX,
    DEFAULT_STARTING_COUNTER_TWO,
} from '@app/services/constants';
import { TileStructure } from '@common/game-structure';

@Injectable({
    providedIn: 'root',
})
export class DragDropService {
    startingPointNumberCounter: number = DEFAULT_STARTING_COUNTER_TWO;
    randomItemCounter: number = DEFAULT_STARTING_COUNTER_TWO;
    draggedTile: string = '';
    transparentImage: string = '';

    setDraggedObject(objectType: string) {
        this.draggedTile = objectType;
    }

    resetDraggedObject() {
        this.draggedTile = '';
        this.transparentImage = '';
    }

    setMultipleItemCounter(mapSize: number, map: TileStructure[]) {
        const placedStartingPoints = this.countStartingPoints(map);
        const placedRandomItems = this.countPlacedRandomItems(map);

        let startingCounter: number;
        if (mapSize === DEFAULT_MAP_SIZE_SMALL) {
            startingCounter = DEFAULT_STARTING_COUNTER_TWO;
        } else if (mapSize === DEFAULT_MAP_SIZE_MEDIUM) {
            startingCounter = DEFAULT_STARTING_COUNTER_FOUR;
        } else {
            startingCounter = DEFAULT_STARTING_COUNTER_SIX;
        }

        this.startingPointNumberCounter = startingCounter - placedStartingPoints < 0 ? 0 : startingCounter - placedStartingPoints;
        this.randomItemCounter = startingCounter - placedRandomItems < 0 ? 0 : startingCounter - placedRandomItems;
    }

    countStartingPoints(map: TileStructure[]) {
        return map.reduce((acc, tile) => {
            return tile.item === 'startingPoint' ? acc + 1 : acc;
        }, 0);
    }

    countPlacedRandomItems(map: TileStructure[]) {
        return map.reduce((acc, tile) => {
            return tile.item === 'item-aleatoire' ? acc + 1 : acc;
        }, 0);
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
