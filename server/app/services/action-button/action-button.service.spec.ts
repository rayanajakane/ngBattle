import { Test, TestingModule } from '@nestjs/testing';
import { ActionButtonService } from './action-button.service';

describe('ActionButtonService', () => {
    let service: ActionButtonService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ActionButtonService],
        }).compile();

        service = module.get<ActionButtonService>(ActionButtonService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
