import { Injectable } from '@angular/core';
import { State } from '@app/interfaces/state';

@Injectable({
    providedIn: 'root',
})
export class CombatStateService implements State {
    constructor() {}

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
