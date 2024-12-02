import { Test, TestingModule } from '@nestjs/testing';
import { ActionHandlerService } from '../action-handler/action-handler.service';
import { GlobalStatsService } from './global-stats.service';

describe('GlobalStatsService', () => {
    let service: GlobalStatsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                Number,
                GlobalStatsService,
                {
                    provide: ActionHandlerService,
                    useValue: {},
                },
            ],
        }).compile();

        service = module.get<GlobalStatsService>(GlobalStatsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
