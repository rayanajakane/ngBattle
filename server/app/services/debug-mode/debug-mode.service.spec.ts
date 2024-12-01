import { Test, TestingModule } from '@nestjs/testing';
import { ActionService } from '../action/action.service';
import { ActiveGamesService } from '../active-games/active-games.service';
import { GameService } from '../game.service';
import { LogSenderService } from '../log-sender/log-sender.service';
import { MovementService } from '../movement/movement.service';
import { UniqueItemRandomizerService } from '../unique-item-randomiser/unique-item-randomiser.service';
import { DebugModeService } from './debug-mode.service';

describe('DebugModeService', () => {
    let service: DebugModeService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DebugModeService,
                ActiveGamesService,
                LogSenderService,
                ActionService,
                GameService,
                UniqueItemRandomizerService,
                MovementService,
                {
                    provide: 'GameModel',
                    useValue: {},
                },
            ],
        }).compile();

        service = module.get<DebugModeService>(DebugModeService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
