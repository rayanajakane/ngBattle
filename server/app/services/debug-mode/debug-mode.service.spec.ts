import { Test, TestingModule } from '@nestjs/testing';
import { DebugModeService } from './debug-mode.service';

describe('DebugModeService', () => {
    let service: DebugModeService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DebugModeService],
        }).compile();

        service = module.get<DebugModeService>(DebugModeService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
