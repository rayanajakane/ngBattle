import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { GameService } from '@app/services/game.service';
import { InventoryService } from '@app/services/inventory/inventory.service';
import { UniqueItemRandomizerService } from '@app/services/unique-item-randomiser/unique-item-randomiser.service';
import { Test, TestingModule } from '@nestjs/testing';
import { InventoryGateway } from './inventory.gateway';

describe('InventoryGateway', () => {
    let gateway: InventoryGateway;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                InventoryGateway,
                InventoryService,
                ActiveGamesService,
                GameService,
                UniqueItemRandomizerService,
                { provide: 'GameModel', useValue: {} },
            ],
        }).compile();

        gateway = module.get<InventoryGateway>(InventoryGateway);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
});
