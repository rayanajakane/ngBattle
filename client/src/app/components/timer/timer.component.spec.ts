import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { COUNTDOWN_DELAY, TIME_LEFT } from '@app/components/timer/constant';
import { TimerComponent } from './timer.component';

describe('TimerComponent', () => {
    let component: TimerComponent;
    let fixture: ComponentFixture<TimerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TimerComponent],
        }).compileComponents();

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

    // it('should start the timer', fakeAsync(() => {
    //     component.startTimer();
    //     expect(component.isRunning).toBeTrue();
    //     expect(component.isActive).toBeTrue();
    //     tick(COUNTDOWN_DELAY);
    //     expect(component.timeLeft).toBe(TIME_LEFT - 1);
    // }));

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
