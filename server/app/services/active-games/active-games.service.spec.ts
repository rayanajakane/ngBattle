import { GameService } from '@app/services/game.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ActiveGamesService } from './active-games.service';

describe('ActiveGamesService', () => {
    let service: ActiveGamesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ActiveGamesService, GameService, { provide: 'GameModel', useValue: {} }],
        }).compile();

        service = module.get<ActiveGamesService>(ActiveGamesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
