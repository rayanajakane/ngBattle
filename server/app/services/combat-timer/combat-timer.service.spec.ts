import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'socket.io';
import { CombatTimerService } from './combat-timer.service';

describe('CombatTimerService', () => {
    let service: CombatTimerService;
    let mockServer: Server;

    beforeEach(async () => {
        // Create mock server with required methods
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
});
