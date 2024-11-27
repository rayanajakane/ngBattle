import { Test, TestingModule } from '@nestjs/testing';
import { ActionService } from '../action/action.service';
import { ActiveGamesService } from '../active-games/active-games.service';
import { CombatService } from '../combat/combat.service';
import { DebugModeService } from '../debug-mode/debug-mode.service';
import { MatchService } from '../match.service';
import { ActionHandlerService } from './action-handler.service';

describe('ActionHandlerService', () => {
    let service: ActionHandlerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CombatService,
                DebugModeService,
                ActionHandlerService,
                {
                    provide: ActionService,
                    useValue: {}, // Mock or actual implementation
                },
                {
                    provide: MatchService,
                    useValue: {}, // Mock or actual implementation
                },
                {
                    provide: ActiveGamesService,
                    useValue: {}, // Mock or actual implementation
                },
            ],
        }).compile();

        service = module.get<ActionHandlerService>(ActionHandlerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
