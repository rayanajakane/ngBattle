import { INTERVAL_DURATION, TIME } from '@app/services/combat-timer/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'socket.io';
import { ActionHandlerService } from '../action-handler/action-handler.service';
import { LogSenderService } from '../log-sender/log-sender.service';
import { CombatTimerService } from './combat-timer.service';

describe('CombatTimerService', () => {
    let service: CombatTimerService;
    let mockServer: Server;

    beforeEach(async () => {
        // Create mock server with required methods
        mockServer = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            any: {} as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;

        const mockRoomId = 'testRoom';

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: CombatTimerService,
                    useFactory: () => new CombatTimerService(mockServer, mockRoomId),
                },
                {
                    provide: ActionHandlerService,
                    useValue: {},
                },
                {
                    provide: LogSenderService,
                    useValue: {},
                },
            ],
        }).compile();

        service = module.get<CombatTimerService>(CombatTimerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    jest.useFakeTimers();

    describe('CombatTimerService', () => {
        let service: CombatTimerService;
        let mockServer: Server;

        beforeEach(async () => {
            mockServer = {
                to: jest.fn().mockReturnThis(),
                emit: jest.fn(),
            } as any;

            const mockRoomId = 'testRoom';

            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    {
                        provide: CombatTimerService,
                        useFactory: () => new CombatTimerService(mockServer, mockRoomId),
                    },
                ],
            }).compile();

            service = module.get<CombatTimerService>(CombatTimerService);
        });

        it('should be defined', () => {
            expect(service).toBeDefined();
        });

        // it('should start the timer with escape', () => {
        //     service.startTimer(true);
        //     expect(service['currentTime']).toBe(TIME);
        //     expect(setInterval).toHaveBeenCalledWith(expect.any(Function), INTERVAL_DURATION);
        // });

        // it('should start the timer without escape', () => {
        //     service.startTimer(false);
        //     expect(service['currentTime']).toBe(TIME_NO_ESCAPE);
        //     expect(setInterval).toHaveBeenCalledWith(expect.any(Function), INTERVAL_DURATION);
        // });

        it('should reset the timer', () => {
            service.resetTimer();
            expect(service['intervalId']).toBeNull();
            expect(mockServer.to).toHaveBeenCalledWith('testRoom');
            expect(mockServer.emit).toHaveBeenCalledWith('CombatTimerUpdate', TIME);
        });

        it('should clear the timer on destroy', () => {
            service.onDestroy();
            expect(service['intervalId']).toBeNull();
        });

        it('should decrement the timer and emit updates', () => {
            service.startTimer(true);
            jest.advanceTimersByTime(INTERVAL_DURATION);
            expect(service['currentTime']).toBe(TIME - 1);
            expect(mockServer.emit).toHaveBeenCalledWith('CombatTimerUpdate', TIME - 1);
        });

        // it('should emit endCombatTimer when timer reaches zero', () => {
        //     service.startTimer(true);
        //     service['currentTime'] = 1;
        //     jest.advanceTimersByTime(INTERVAL_DURATION);
        //     expect(service['currentTime']).toBe(0);
        //     expect(mockServer.emit).toHaveBeenCalledWith('CombatTimerUpdate', 0);
        //     expect(mockServer.emit).toHaveBeenCalledWith('endCombatTimer');
        // });
    });
});
