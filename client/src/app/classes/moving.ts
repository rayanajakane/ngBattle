import { State } from '@app/interfaces/state';

export class Moving implements State {
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
