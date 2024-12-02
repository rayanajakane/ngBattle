import { Test, TestingModule } from '@nestjs/testing';
import { ActiveGamesService } from '../active-games/active-games.service';
import { GameService } from '../game.service';
import { UniqueItemRandomizerService } from '../unique-item-randomiser/unique-item-randomiser.service';
import { LogSenderService } from './log-sender.service';

describe('LogSenderService', () => {
    let service: LogSenderService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [LogSenderService, ActiveGamesService, GameService, UniqueItemRandomizerService, { provide: 'GameModel', useValue: {} }],
        }).compile();

        service = module.get<LogSenderService>(LogSenderService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
