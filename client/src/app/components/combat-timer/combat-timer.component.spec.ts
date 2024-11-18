import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { COUNTDOWN_DELAY } from '@app/components/timer/constant';
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
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should start the timer', () => {
        component.startTimer();
        expect(component.isRunning).toBeTrue();
        expect(component.isActive).toBeTrue();
    });

    it('should decrement timeLeft and stop timer at zero', fakeAsync(() => {
        component.timeLeft = 3;
        spyOn(component, 'stopTimer');

        component.startTimer();

        tick(COUNTDOWN_DELAY); // Simulate passage of time
        expect(component.timeLeft).toBe(2);

        tick(COUNTDOWN_DELAY);
        expect(component.timeLeft).toBe(1);

        tick(COUNTDOWN_DELAY);
        expect(component.timeLeft).toBe(0);
        expect(component.stopTimer).toHaveBeenCalled();
    }));

    it('should stop the timer if it is already running', () => {
        component.isRunning = true;
        component.startTimer();
        expect(component.stopTimer()).toHaveBeenCalled();
    });

    it('should stop the timer', () => {
        component.stopTimer();
        expect(component.isRunning).toBeFalse();
        expect(component.isActive).toBeFalse();
    });
});
