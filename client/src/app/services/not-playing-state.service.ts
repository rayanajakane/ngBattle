import { Injectable } from '@angular/core';
import { State } from '@app/interfaces/state';

@Injectable({
    providedIn: 'root',
})
export class NotPlayingStateService implements State {
    constructor() {}

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
