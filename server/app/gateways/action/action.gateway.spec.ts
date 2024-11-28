import { ActionHandlerService } from '@app/services/action-handler/action-handler.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { DebugModeService } from '@app/services/debug-mode/debug-mode.service';
import { GameService } from '@app/services/game.service';
import { InventoryService } from '@app/services/inventory/inventory.service';
import { UniqueItemRandomizerService } from '@app/services/unique-item-randomiser/unique-item-randomiser.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ActionGateway } from './action.gateway';

describe('ActionGateway', () => {
    let gateway: ActionGateway;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DebugModeService,
                InventoryService,
                ActiveGamesService,
                ActionGateway,
                GameService,
                UniqueItemRandomizerService,
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
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    // describe('handleGameSetup', () => {
    //     it('should call handleGameSetup on actionHandlerService with correct parameters', () => {
    //         const roomId = 'testRoomId';
    //         const server = new Server();

    //         gateway['server'] = server;
    //         gateway.handleGameSetup(roomId);

    //         expect(actionHandlerService.handleGameSetup).toHaveBeenCalledWith(server, roomId);
    //     });
    // });

    // describe('handleStartTurn', () => {
    //     it('should call handleStartTurn on actionHandlerService with correct parameters', () => {
    //         const data = { roomId: 'testRoomId', playerId: 'testPlayerId' };
    //         const client = { id: 'testClientId' } as Socket;
    //         const server = new Server();

    //         gateway['server'] = server;
    //         gateway.handleStartTurn(data, client);

    //         expect(actionHandlerService.handleStartTurn).toHaveBeenCalledWith(data, server, client);
    //     });
    // });

    // describe('handleMove', () => {
    //     it('should call handleMove on actionHandlerService with correct parameters', () => {
    //         const data = { roomId: 'testRoomId', playerId: 'testPlayerId', endPosition: 1 };
    //         const client = { id: 'testClientId' } as Socket;
    //         const server = new Server();

    //         gateway['server'] = server;
    //         gateway.handleMove(data, client);

    //         expect(actionHandlerService.handleMove).toHaveBeenCalledWith(data, server, client);
    //     });
    // });

    // describe('handleEndTurn', () => {
    //     it('should call handleEndTurn on actionHandlerService with correct parameters', () => {
    //         const data = { roomId: 'testRoomId', playerId: 'testPlayerId', lastTurn: true };
    //         const server = new Server();

    //         gateway['server'] = server;
    //         gateway.handleEndTurn(data);

    //         expect(actionHandlerService.handleEndTurn).toHaveBeenCalledWith(data, server);
    //     });
    // });

    // describe('handleInteractDoor', () => {
    //     it('should call handleInteractDoor on actionHandlerService with correct parameters', () => {
    //         const client = { id: 'testClientId' } as Socket;
    //         const data = { roomId: 'testRoomId', playerId: 'testPlayerId', doorPosition: 1 };
    //         const server = new Server();

    //         gateway['server'] = server;
    //         gateway.handleInteractDoor(client, data);

    //         expect(actionHandlerService.handleInteractDoor).toHaveBeenCalledWith(data, server, client);
    //     });
    // });

    // describe('handleQuitGame', () => {
    //     it('should call handleQuitGame on actionHandlerService with correct parameters', () => {
    //         const client = { id: 'testClientId' } as Socket;
    //         const data = { roomId: 'testRoomId', playerId: 'testPlayerId' };
    //         const server = new Server();

    //         gateway['server'] = server;
    //         gateway.handleQuitGame(client, data);

    //         expect(actionHandlerService.handleQuitGame).toHaveBeenCalledWith(data, server, client);
    //     });
    // });

    // describe('afterInit', () => {
    //     it('should set server property', () => {
    //         const server = new Server();

    //         gateway.afterInit(server);

    //         expect(gateway['server']).toBe(server);
    //     });
    // });

    // describe('handleGetAvailableMovesOnBudget', () => {
    //     it('should call handleGetAvailableMovesOnBudget on actionHandlerService with correct parameters', () => {
    //         const data = { roomId: 'testRoomId', playerId: 'testPlayerId', currentBudget: 100 };
    //         const client = { id: 'testClientId' } as Socket;

    //         gateway.handleGetAvailableMovesOnBudget(data, client);

    //         expect(actionHandlerService.handleGetAvailableMovesOnBudget).toHaveBeenCalledWith(data, client);
    //     });
    // });
});
