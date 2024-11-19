import { Component, Input, OnChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { COUNTDOWN_DELAY, TIME_LEFT } from '@app/components/timer/constant';
import { TimerState } from '@common/game-structure';
import { interval, Subscription } from 'rxjs';

@Component({
    selector: 'app-timer',
    standalone: true,
    imports: [MatButtonModule, MatIconModule],
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements OnChanges {
    @Input() timeLeft: number = TIME_LEFT; // Set the initial time in seconds
    timerSubscription: Subscription | null = null;
    isRunning: boolean = false;
    isActive: boolean = false;

    @Input() timerState: TimerState;
    timerStateEnum: string;

    ngOnChanges() {
        this.changeTimerStateEnum(this.timerState);
    }

    changeTimerStateEnum(timerState: TimerState) {
        switch (timerState) {
            case TimerState.REGULAR:
                this.timerStateEnum = 'Jeu';
                break;
            case TimerState.COOLDOWN:
                this.timerStateEnum = 'Repos';
                break;
            case TimerState.COMBAT:
                this.timerStateEnum = 'Combat';
                break;
            default:
                this.timerStateEnum = '';
                break;
        }
    }

    startTimer() {
        if (this.isRunning) {
            this.stopTimer(); // Stop the existing timer if it's running
        }
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
