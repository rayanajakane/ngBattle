import { UniqueItemRandomizerService } from '@app/services/unique-item-randomiser/unique-item-randomiser.service';
import { Test, TestingModule } from '@nestjs/testing';
import { LogSenderService } from '../log-sender/log-sender.service';

describe('UniqueItemRandomizerService', () => {
    let service: UniqueItemRandomizerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UniqueItemRandomizerService,
                {
                    provide: LogSenderService,
                    useValue: {},
                },
            ],
        }).compile();

        service = module.get<UniqueItemRandomizerService>(UniqueItemRandomizerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
