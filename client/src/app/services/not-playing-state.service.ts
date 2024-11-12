import { Injectable } from '@angular/core';
import { State } from '@app/interfaces/state';

@Injectable({
    providedIn: 'root',
})
export class NotPlayingStateService implements State {
    availableTiles: number[] = [];

    getAvailableTiles(): number[] {
        return this.availableTiles;
    }

    setAvailableTiles(availableTiles: number[]): void {
        this.availableTiles = availableTiles;
    }

    availablesTilesIncludes(index: number): boolean {
        return this.availableTiles.includes(index);
    }

    onRightClick(index: number): void {
        console.log('You are doing nothing', index);
    }

    onMouseDown(): void {
        console.log('You are doing nothing');
    }

    onMouseEnter(): void {
        console.log('You are doing nothing');
    }
}
