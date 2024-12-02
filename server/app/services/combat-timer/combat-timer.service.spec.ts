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
});
