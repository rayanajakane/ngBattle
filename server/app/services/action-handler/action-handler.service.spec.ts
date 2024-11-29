import { ActionHandlerService } from '@app/services/action-handler/action-handler.service';
import { ActionService } from '@app/services/action/action.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { CombatService } from '@app/services/combat/combat.service';
import { DebugModeService } from '@app/services/debug-mode/debug-mode.service';
import { MatchService } from '@app/services/match.service';
import { UniqueItemRandomizerService } from '@app/services/unique-item-randomiser/unique-item-randomiser.service';
import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from '../inventory/inventory.service';

describe('ActionHandlerService', () => {
    let service: ActionHandlerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CombatService,
                UniqueItemRandomizerService,
                InventoryService,
                UniqueItemRandomizerService,
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
