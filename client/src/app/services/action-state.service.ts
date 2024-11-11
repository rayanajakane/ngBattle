import { Injectable } from '@angular/core';
import { State } from '@app/interfaces/state';

@Injectable({
    providedIn: 'root',
})
export class ActionStateService implements State {
    constructor() {}

    onRightClick(index: number): void {
        console.log('You are doing action', index);
    }

    onMouseDown(): void {
        console.log('You are doing action');
    }

    onMouseEnter(): void {
        console.log('You are doing action');
    }
}
