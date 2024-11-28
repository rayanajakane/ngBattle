import { ActionHandlerService } from '@app/services/action-handler/action-handler.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { GameService } from '@app/services/game.service';
import { InventoryService } from '@app/services/inventory/inventory.service';
import { UniqueItemRandomizerService } from '@app/services/unique-item-randomiser/unique-item-randomiser.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'http';
import { InventoryGateway } from './inventory.gateway';

describe('InventoryGateway', () => {
    let gateway: InventoryGateway;
    let actionHandler: ActionHandlerService;
    let server: Server;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                InventoryGateway,
                InventoryService,
                ActiveGamesService,
                {
                    provide: ActionHandlerService,
                    useValue: {
                        handleGameSetup: jest.fn(),
                    },
                },
                GameService,
                UniqueItemRandomizerService,
                { provide: 'GameModel', useValue: {} },
            ],
        }).compile();

        gateway = module.get<InventoryGateway>(InventoryGateway);
        actionHandler = module.get<ActionHandlerService>(ActionHandlerService);
        server = {} as Server;
    });

    it('should exist', () => {
        expect(gateway).toBeDefined();
    });
});
