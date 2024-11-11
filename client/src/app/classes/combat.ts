import { State } from '@app/interfaces/state';

export class Combat implements State {
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
