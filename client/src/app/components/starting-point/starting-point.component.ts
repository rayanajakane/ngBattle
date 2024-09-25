import { Component } from '@angular/core';
import { DEFAULT_STARTING_POINT_NUMBER } from './startingPointNumber';
@Component({
    selector: 'app-starting-point',
    standalone: true,
    imports: [],
    templateUrl: './starting-point.component.html',
    styleUrl: './starting-point.component.scss',
})
export class StartingPointComponent {
    startingPointNumber: number = DEFAULT_STARTING_POINT_NUMBER;
    reduceNumber() {
        if (this.startingPointNumber > 0) {
            this.startingPointNumber--;
        }
    }

    resetNumber() {
        this.startingPointNumber = DEFAULT_STARTING_POINT_NUMBER;
    }
}
