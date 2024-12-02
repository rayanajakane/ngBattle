import { Test, TestingModule } from '@nestjs/testing';
import { ActionButtonService } from '../action-button/action-button.service';
import { ActionHandlerService } from '../action-handler/action-handler.service';
import { ActionService } from '../action/action.service';
import { ActiveGamesService } from '../active-games/active-games.service';
import { CombatService } from '../combat/combat.service';
import { DebugModeService } from '../debug-mode/debug-mode.service';
import { GameService } from '../game.service';
import { InventoryService } from '../inventory/inventory.service';
import { LogSenderService } from '../log-sender/log-sender.service';
import { MatchService } from '../match.service';
import { MovementService } from '../movement/movement.service';
import { UniqueItemRandomizerService } from '../unique-item-randomiser/unique-item-randomiser.service';
import { VirtualPlayerService } from '../virtual-player/virtual-player.service';
import { CombatHandlerService } from './combat-handler.service';

describe('CombatHandlerService', () => {
    let service: CombatHandlerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CombatHandlerService,
                ActiveGamesService,
                LogSenderService,
                MovementService,
                MatchService,

                {
                    provide: CombatService,
                    useValue: {},
                },
                ActionButtonService,

                {
                    provide: ActionHandlerService,
                    useValue: {},
                },
                InventoryService,
                CombatService,
                DebugModeService,
                {
                    provide: VirtualPlayerService,
                    useValue: {},
                },
                {
                    provide: 'GameModel',
                    useValue: {},
                },
                ActionService,
                GameService,
                UniqueItemRandomizerService,
            ],
        }).compile();

        service = module.get<CombatHandlerService>(CombatHandlerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
