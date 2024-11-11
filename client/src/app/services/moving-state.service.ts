import { Injectable } from '@angular/core';
import { State } from '@app/interfaces/state';

@Injectable({
    providedIn: 'root',
})
export class MovingStateService implements State {
    constructor() {}

    onRightClick(index: number): void {
        console.log('You are moving', index);
    }

    onMouseDown(): void {
        console.log('You are moving');
    }

    onMouseEnter(): void {
        console.log('You are moving');
    }
}
