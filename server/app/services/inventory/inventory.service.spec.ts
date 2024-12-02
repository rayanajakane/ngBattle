import { Test, TestingModule } from '@nestjs/testing';
import { ActiveGamesService } from '../active-games/active-games.service';
import { GameService } from '../game.service';
import { LogSenderService } from '../log-sender/log-sender.service';
import { UniqueItemRandomizerService } from '../unique-item-randomiser/unique-item-randomiser.service';
import { InventoryService } from './inventory.service';
import { ActionHandlerService } from '../action-handler/action-handler.service';
describe('InventoryService', () => {
    let service: InventoryService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                InventoryService,
                ActiveGamesService,
                {
                    provide: LogSenderService,
                    useValue: {},
                },
                UniqueItemRandomizerService,
                GameService,
                {
                    provide: ActionHandlerService,
                    useValue: {},
                },
                {
                    provide: 'GameModel',
                    useValue: {},
                },
            ],
        }).compile();

        service = module.get<InventoryService>(InventoryService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
