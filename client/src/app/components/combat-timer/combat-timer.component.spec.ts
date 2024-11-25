import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { COUNTDOWN_DELAY, TIME_LEFT } from '@app/components/timer/constant';
import { CombatTimerComponent } from './combat-timer.component';

describe('CombatTimerComponent', () => {
    let component: CombatTimerComponent;
    let fixture: ComponentFixture<CombatTimerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CombatTimerComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CombatTimerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.timeLeft = TIME_LEFT; // Reset timeLeft
        component.isRunning = false; // Reset isRunning
        component.isActive = false; // Reset isActive
        component.timerSubscription = null; // Reset timerSubscription
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should start the timer', () => {
        component.startTimer();
        expect(component.isRunning).toBeTrue();
        expect(component.isActive).toBeTrue();
    });

    it('should decrement timeLeft until it reaches zero', fakeAsync(() => {
        component.startTimer();
        tick(COUNTDOWN_DELAY * (TIME_LEFT + 1)); // Ensure we go past zero
        expect(component.timeLeft).toBe(0);
        expect(component.isRunning).toBeFalse();
        expect(component.isActive).toBeFalse();
    }));

    it('should stop the timer if it is already running', () => {
        component.isRunning = true;
        spyOn(component, 'stopTimer');
        component.startTimer();
        expect(component.stopTimer).toHaveBeenCalled();
    });

    it('should stop the timer', () => {
        component.stopTimer();
        expect(component.isRunning).toBeFalse();
        expect(component.isActive).toBeFalse();
    });
});
