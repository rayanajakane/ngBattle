import { inject, Injectable } from '@angular/core';
import { ShortestPathByTile } from '@common/game-structure';
import { GameControllerService } from './game-controller.service';

@Injectable({
    providedIn: 'root',
})
export abstract class BaseStateService {
    availableTiles: number[] = [];
    shortestPathByTile: ShortestPathByTile = {};

    gameController = inject(GameControllerService);

    constructor() {}

    getAvailableTiles(): number[] {
        return this.availableTiles;
    }

    setAvailableTiles(availableTiles: number[]): void {
        this.availableTiles = availableTiles;
    }

    resetAvailableTiles(): void {
        this.availableTiles = [];
    }

    availablesTilesIncludes(index: number): boolean {
        return this.availableTiles.includes(index);
    }

    getShortestPathByIndex(index: number): number[] {
        return this.shortestPathByTile[index];
    }

    setShortestPathByTile(shortestPathByTile: ShortestPathByTile): void {
        this.shortestPathByTile = shortestPathByTile;
    }

    resetShortestPathByTile(): void {
        this.shortestPathByTile = {};
    }

    abstract initializePrevizualisation(accessibleTiles: ShortestPathByTile | number[]): void;

    abstract onRightClick(index: number): void;
    abstract onMouseDown(index: number): void;
    abstract onMouseEnter(): void;
}
