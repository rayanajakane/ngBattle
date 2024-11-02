import { Test, TestingModule } from '@nestjs/testing';
import { ActionService } from './map_state_handler.service';

describe('ActionService', () => {
    let service: ActionService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ActionService],
        }).compile();

        service = module.get<ActionService>(ActionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
