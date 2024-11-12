import { Injectable } from '@angular/core';
import { State } from '@app/interfaces/state';

@Injectable({
    providedIn: 'root',
})
export class CombatStateService implements State {
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
        console.log('You are in combat', index);
    }

    onMouseDown(): void {
        console.log('You are in combat');
    }

    onMouseEnter(): void {
        console.log('You are in combat');
    }
}
