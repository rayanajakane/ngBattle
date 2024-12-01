import { ActionHandlerService } from '@app/services/action-handler/action-handler.service';
import { ActionService } from '@app/services/action/action.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { DebugModeService } from '@app/services/debug-mode/debug-mode.service';
import { GameService } from '@app/services/game.service';
import { InventoryService } from '@app/services/inventory/inventory.service';
import { LogSenderService } from '@app/services/log-sender/log-sender.service';
import { MatchService } from '@app/services/match.service';
import { MovementService } from '@app/services/movement/movement.service';
import { UniqueItemRandomizerService } from '@app/services/unique-item-randomiser/unique-item-randomiser.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'http';
import { ActionGateway } from './action.gateway';

describe('ActionGateway', () => {
    let gateway: ActionGateway;
    let actionHandlerService: ActionHandlerService;
    let server: Server;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DebugModeService,
                InventoryService,
                Server,
                ActiveGamesService,
                ActionGateway,
                GameService,
                MovementService,
                LogSenderService,
                MatchService,
                UniqueItemRandomizerService,
                ActionService,
                {
                    provide: ActionHandlerService,
                    useValue: {
                        handleGameSetup: jest.fn(),
                    },
                },
                {
                    provide: 'GameModel',
                    useValue: {},
                },
            ],
        }).compile();

        gateway = module.get<ActionGateway>(ActionGateway);
        actionHandlerService = module.get<ActionHandlerService>(ActionHandlerService);
        server = module.get<Server>(Server);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('should handle game setup', () => {
        const roomId = 'roomId';

        gateway.handleGameSetup(roomId);

        expect(actionHandlerService.handleGameSetup).toHaveBeenCalledWith(null, roomId);
    });
});
