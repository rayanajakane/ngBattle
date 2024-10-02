import { Component } from '@angular/core';

@Component({
    selector: 'app-waiting-page',
    standalone: true,
    imports: [],
    templateUrl: './waiting-page.component.html',
    styleUrl: './waiting-page.component.scss',
})
export class WaitingPageComponent {
    randomNumber: number;
    private readonly floorRandomNumber: number = 1000;
    private readonly maxValueRandomNumber: number = 8999;
    constructor() {
        this.randomNumber = this.genrateRandomFourDigitNumber();
    }

    genrateRandomFourDigitNumber(): number {
        return Math.floor(this.floorRandomNumber + Math.random() * this.maxValueRandomNumber);
    }
}
