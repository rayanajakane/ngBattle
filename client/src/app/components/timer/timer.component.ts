import { Component, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { COUNTDOWN_DELAY } from '@app/components/timer/constant';
import { interval, Subscription } from 'rxjs';

@Component({
    selector: 'app-timer',
    standalone: true,
    imports: [MatButtonModule, MatIconModule],
    templateUrl: './timer.component.html',
    styleUrl: './timer.component.scss',
})
export class TimerComponent implements OnDestroy {
    timeLeft: number = 59; // Set the initial time in seconds
    timerSubscription: Subscription | null = null;
    isRunning: boolean = false;
    isActive: boolean = false;

    startTimer() {
        if (this.isRunning) return; // Prevent starting multiple timers
        this.isActive = true;
        this.isRunning = true;

        this.timerSubscription = interval(COUNTDOWN_DELAY).subscribe(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
            } else {
                this.stopTimer(); // Stop the timer when it reaches zero
            }
        });
    }

    // this can be called at the end of the turn.
    stopTimer() {
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
            this.timerSubscription = null;
        }
        this.isRunning = false;
        this.isActive = false;
    }

    ngOnDestroy() {
        this.stopTimer();
    }
}
