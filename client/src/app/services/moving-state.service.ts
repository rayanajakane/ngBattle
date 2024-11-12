import { inject, Injectable } from '@angular/core';
import { State } from '@app/interfaces/state';
import { GameControllerService } from './game-controller.service';

@Injectable({
    providedIn: 'root',
})
export class MovingStateService implements State {
    availableTiles: number[] = [];

    gameController = inject(GameControllerService);

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
        console.log('You are moving', index);
    }

    onMouseDown(index: number): void {
        if (this.availableTiles.includes(index)) {
            this.gameController.requestMove(index);
        }
    }

    onMouseEnter(): void {
        console.log('You are moving');
    }
}
