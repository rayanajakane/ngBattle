import { Test, TestingModule } from '@nestjs/testing';
import { ActionHandlerService } from '../action-handler/action-handler.service';
import { ActionService } from '../action/action.service';
import { ActiveGamesService } from '../active-games/active-games.service';
import { CombatHandlerService } from '../combat-handler/combat-handler.service';
import { InventoryService } from '../inventory/inventory.service';
import { MovementService } from '../movement/movement.service';
import { VirtualPlayerService } from '../virtual-player/virtual-player.service';
import { ActionButtonService } from './../action-button/action-button.service';
import { GlobalStatsService } from './global-stats.service';

describe('GlobalStatsService', () => {
    let service: GlobalStatsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GlobalStatsService,
                Number,
                {
                    provide: InventoryService,
                    useValue: {},
                },
                {
                    provide: ActionService,
                    useValue: {},
                },
                {
                    provide: CombatHandlerService,
                    useValue: {},
                },
                {
                    provide: ActionHandlerService,
                    useValue: {},
                },
                {
                    provide: ActiveGamesService,
                    useValue: {},
                },
                {
                    provide: ActionButtonService,
                    useValue: {},
                },
                {
                    provide: MovementService,
                    useValue: {},
                },
                VirtualPlayerService,
            ],
        }).compile();

        service = module.get<GlobalStatsService>(GlobalStatsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
