import { ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { COUNTDOWN_DELAY, TIME_LEFT } from '@app/components/timer/constant';
import { TimerComponent } from './timer.component';

describe('TimerComponent', () => {
    let component: TimerComponent;
    let fixture: ComponentFixture<TimerComponent>;

    beforeEach(async () => {
        fixture = TestBed.createComponent(TimerComponent);
        component = fixture.componentInstance;
        component.timeLeft = TIME_LEFT; // Reset timeLeft
        component.isRunning = false; // Reset isRunning
        component.isActive = false; // Reset isActive
        component.timerSubscription = null; // Reset timerSubscription
        fixture.detectChanges();
    });

    afterEach(() => {
        if (fixture) {
            fixture.destroy();
        }
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should start the timer if it is not running', fakeAsync(() => {
        component.isRunning = false;
        component.startTimer();
        expect(component.isRunning).toBeTrue();
        expect(component.isActive).toBeTrue();
        expect(component.timerSubscription).not.toBeNull();
        tick(COUNTDOWN_DELAY); // Flush any pending timers
        component.stopTimer();
        discardPeriodicTasks();
    }));

    it('should stop the existing timer and start a new one if it is already running', fakeAsync(() => {
        component.isRunning = true;
        const stopTimerSpy = spyOn(component, 'stopTimer').and.callThrough();
        component.startTimer();
        expect(stopTimerSpy).toHaveBeenCalled();
        expect(component.isRunning).toBeTrue();
        expect(component.isActive).toBeTrue();
        expect(component.timerSubscription).not.toBeNull();
        component.stopTimer();
        discardPeriodicTasks();
    }));
    it('should stop the timer', fakeAsync(() => {
        component.startTimer();
        tick(COUNTDOWN_DELAY);
        component.stopTimer();
        expect(component.isRunning).toBeFalse();
        expect(component.isActive).toBeFalse();
        expect(component.timerSubscription).toBeNull();
    }));

    it('should decrement timeLeft until it reaches zero', fakeAsync(() => {
        component.startTimer();
        tick(COUNTDOWN_DELAY * (TIME_LEFT + 1)); // Ensure we go past zero
        expect(component.timeLeft).toBe(0);
        expect(component.isRunning).toBeFalse();
        expect(component.isActive).toBeFalse();
    }));

    it('should clean up on destroy', fakeAsync(() => {
        component.startTimer();
        tick(COUNTDOWN_DELAY); // Allow some time for the timer to start
        component.ngOnDestroy();
        expect(component.isRunning).toBeFalse();
        expect(component.isActive).toBeFalse();
        expect(component.timerSubscription).toBeNull();
    }));
});
