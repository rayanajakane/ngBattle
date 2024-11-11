import { State } from '@app/interfaces/state';

export class None implements State {
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
