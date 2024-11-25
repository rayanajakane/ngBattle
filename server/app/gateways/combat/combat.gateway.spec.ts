import { ActionButtonService } from '@app/services/action-button/action-button.service';
import { ActionHandlerService } from '@app/services/action-handler/action-handler.service';
import { ActionService } from '@app/services/action/action.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { CombatService } from '@app/services/combat/combat.service';
import { GameService } from '@app/services/game.service';
import { MatchService } from '@app/services/match.service';
import { MovementService } from '@app/services/movement/movement.service';
import { Test, TestingModule } from '@nestjs/testing';
import { CombatGateway } from './combat.gateway';
describe('CombatGateway', () => {
    let gateway: CombatGateway;
    let actionButtonService: ActionButtonService;
    let activeGamesService: ActiveGamesService;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameService,
                ActionHandlerService,
                MatchService,
                MovementService,
                CombatGateway,
                CombatService,
                ActionService,
                ActiveGamesService,
                {
                    provide: ActiveGamesService,
                    useValue: {
                        getActiveGame: jest.fn(),
                    },
                },
                {
                    provide: ActionButtonService,
                    useValue: {
                        getAvailableIndexes: jest.fn(),
                    },
                },
                {
                    provide: 'GameModel',
                    useValue: {
                        // Mock implementation of GameModel methods
                    },
                },
            ],
        }).compile();

        gateway = module.get<CombatGateway>(CombatGateway);
        actionButtonService = module.get<ActionButtonService>(ActionButtonService);
        activeGamesService = module.get<ActiveGamesService>(ActiveGamesService);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
});
