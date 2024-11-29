import { UniqueItemRandomizerService } from '@app/services/unique-item-randomiser/unique-item-randomiser.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('UniqueItemRandomizerService', () => {
    let service: UniqueItemRandomizerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [UniqueItemRandomizerService],
        }).compile();

        service = module.get<UniqueItemRandomizerService>(UniqueItemRandomizerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
