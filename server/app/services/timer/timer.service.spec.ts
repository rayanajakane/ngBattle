import { Server } from 'socket.io';
import { TimerService } from './timer.service';
/* eslint-disable */
describe('TimerService', () => {
    let service: TimerService;
    let mockServer: Server;
    let mockEmit: jest.Mock;
    let mockTo: jest.Mock;

    beforeEach(() => {
        jest.useFakeTimers();
        mockEmit = jest.fn();
        mockTo = jest.fn().mockReturnValue({ emit: mockEmit });
        mockServer = { to: mockTo } as unknown as Server;
        service = new TimerService(mockServer, 'testRoom');
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('should initialize with correct values', () => {
        expect(service['currentTime']).toBe(30);
        expect(service['isPaused']).toBe(false);
        expect(service['isCooldown']).toBe(false);
    });

    describe('startTimer', () => {
        it('should start cooldown timer first', () => {
            service.startTimer();
            expect(service['currentTime']).toBe(3);
            expect(service['isCooldown']).toBe(true);
        });

        it('should emit timer updates during cooldown', () => {
            service.startTimer();
            jest.advanceTimersByTime(1000);
            expect(mockTo).toHaveBeenCalledWith('testRoom');
            expect(mockEmit).toHaveBeenCalledWith('timerUpdate', 2);
        });

        it('should transition from cooldown to main timer', () => {
            service.startTimer();
            jest.advanceTimersByTime(3000);
            expect(mockEmit).toHaveBeenCalledWith('endCooldown');
            expect(service['currentTime']).toBe(30);
            expect(service['isCooldown']).toBe(false);
        });

        it('should clear timer if already running', () => {
            service.startTimer();
            service.startTimer();
            expect(service['currentTime']).toBe(3); // Should restart cooldown
        });
    });

    describe('startInterval', () => {
        it('should decrement time every second', () => {
            service['startInterval']();
            jest.advanceTimersByTime(1000);
            expect(service['currentTime']).toBe(29);
            jest.advanceTimersByTime(1000);
            expect(service['currentTime']).toBe(28);
        });

        it('should emit timer updates', () => {
            service['startInterval']();
            jest.advanceTimersByTime(1000);
            expect(mockTo).toHaveBeenCalledWith('testRoom');
            expect(mockEmit).toHaveBeenCalledWith('timerUpdate', 29);
        });

        it('should clear timer when time reaches 0', () => {
            service['startInterval']();
            jest.advanceTimersByTime(33000);
            expect(mockEmit).toHaveBeenCalledWith('timerUpdate', 0);
            expect(mockEmit).toHaveBeenCalledWith('endTimer');
            expect(service['intervalId']).toBeNull();
        });

        it('should emit timer update with 0 when time reaches 0', () => {
            service['startInterval']();
            jest.advanceTimersByTime(33000);
            expect(mockEmit).toHaveBeenCalledWith('timerUpdate', 0);
        });

        it('should emit endTimer when time reaches 0', () => {
            service['startInterval']();
            jest.advanceTimersByTime(33000);
            expect(mockEmit).toHaveBeenCalledWith('endTimer');
        });
    });

    describe('pauseTimer', () => {
        it('should pause running timer', () => {
            service.startTimer();
            jest.advanceTimersByTime(1000);
            service.pauseTimer();
            expect(service['isPaused']).toBe(true);
            jest.advanceTimersByTime(1000);
            expect(service['currentTime']).toBe(2); // Time shouldn't change while paused
        });
    });

    describe('resumeTimer', () => {
        it('should resume paused timer', () => {
            service.startTimer();
            jest.advanceTimersByTime(1000);
            service.pauseTimer();
            service.resumeTimer();
            expect(service['isPaused']).toBe(false);
            jest.advanceTimersByTime(1000);
            expect(service['currentTime']).toBe(1);
        });
    });

    describe('resetTimer', () => {
        it('should reset to initial state', () => {
            service.startTimer();
            jest.advanceTimersByTime(1000);
            service.resetTimer();
            expect(service['currentTime']).toBe(30);
            expect(service['isCooldown']).toBe(false);
            expect(service['isPaused']).toBe(false);
        });
    });

    describe('timer completion', () => {
        it('should emit endTimer when main timer completes', () => {
            service.startTimer();
            jest.advanceTimersByTime(3000); // Complete cooldown
            jest.advanceTimersByTime(30000); // Complete main timer
            expect(mockEmit).toHaveBeenCalledWith('endTimer');
        });
    });

    describe('startTimer', () => {
        it('should start cooldown timer first', () => {
            service.startTimer();
            expect(service['currentTime']).toBe(3);
            expect(service['isCooldown']).toBe(true);
        });

        it('should emit timer updates during cooldown', () => {
            service.startTimer();
            jest.advanceTimersByTime(1000);
            expect(mockTo).toHaveBeenCalledWith('testRoom');
            expect(mockEmit).toHaveBeenCalledWith('timerUpdate', 2);
        });

        it('should transition from cooldown to main timer', () => {
            service.startTimer();
            jest.advanceTimersByTime(3000);
            expect(mockEmit).toHaveBeenCalledWith('endCooldown');
            expect(service['currentTime']).toBe(30);
            expect(service['isCooldown']).toBe(false);
        });

        it('should clear timer if already running', () => {
            service.startTimer();
            service.startTimer();
            expect(service['currentTime']).toBe(3); // Should restart cooldown
        });
    });

    describe('startInterval', () => {
        it('should decrement time every second', () => {
            service['startInterval']();
            jest.advanceTimersByTime(1000);
            expect(service['currentTime']).toBe(29);
            jest.advanceTimersByTime(1000);
            expect(service['currentTime']).toBe(28);
        });

        it('should emit timer updates', () => {
            service['startInterval']();
            jest.advanceTimersByTime(1000);
            expect(mockTo).toHaveBeenCalledWith('testRoom');
            expect(mockEmit).toHaveBeenCalledWith('timerUpdate', 29);
        });

        it('should clear timer when time reaches 0', () => {
            service['startInterval']();
            jest.advanceTimersByTime(33000);
            expect(mockEmit).toHaveBeenCalledWith('timerUpdate', 0);
            expect(mockEmit).toHaveBeenCalledWith('endTimer');
            expect(service['intervalId']).toBeNull();
        });

        it('should emit timer update with 0 when time reaches 0', () => {
            service['startInterval']();
            jest.advanceTimersByTime(33000);
            expect(mockEmit).toHaveBeenCalledWith('timerUpdate', 0);
        });

        it('should emit endTimer when time reaches 0', () => {
            service['startInterval']();
            jest.advanceTimersByTime(33000);
            expect(mockEmit).toHaveBeenCalledWith('endTimer');
        });
    });

    describe('pauseTimer', () => {
        it('should pause running timer', () => {
            service.startTimer();
            jest.advanceTimersByTime(1000);
            service.pauseTimer();
            expect(service['isPaused']).toBe(true);
            jest.advanceTimersByTime(1000);
            expect(service['currentTime']).toBe(2); // Time shouldn't change while paused
        });
    });

    describe('resumeTimer', () => {
        it('should resume paused timer', () => {
            service.startTimer();
            jest.advanceTimersByTime(1000);
            service.pauseTimer();
            service.resumeTimer();
            expect(service['isPaused']).toBe(false);
            jest.advanceTimersByTime(1000);
            expect(service['currentTime']).toBe(1);
        });
    });

    describe('resetTimer', () => {
        it('should reset to initial state', () => {
            service.startTimer();
            jest.advanceTimersByTime(1000);
            service.resetTimer();
            expect(service['currentTime']).toBe(30);
            expect(service['isCooldown']).toBe(false);
            expect(service['isPaused']).toBe(false);
        });
    });

    describe('timer completion', () => {
        it('should emit endTimer when main timer completes', () => {
            service.startTimer();
            jest.advanceTimersByTime(3000); // Complete cooldown
            jest.advanceTimersByTime(30000); // Complete main timer
            expect(mockEmit).toHaveBeenCalledWith('endTimer');
        });
    });

    describe('onDestroy', () => {
        it('should clear timer on destroy', () => {
            service.startTimer();
            service.onDestroy();
            expect(service['intervalId']).toBeNull();
            expect(service['isPaused']).toBe(false);
        });
    });
});
