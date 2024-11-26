import { GameInstance } from '@app/data-structures/game-instance';
import { ActionButtonService } from '@app/services/action-button/action-button.service';
import { ActionHandlerService } from '@app/services/action-handler/action-handler.service';
import { ActionService } from '@app/services/action/action.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { CombatService } from '@app/services/combat/combat.service';
import { DebugModeService } from '@app/services/debug-mode/debug-mode.service';
import { GameService } from '@app/services/game.service';
import { MatchService } from '@app/services/match.service';
import { MovementService } from '@app/services/movement/movement.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'socket.io';
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
                DebugModeService,
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

    it('should handle startAction message', () => {
        const mockRoomId = 'room1';
        const mockPlayerId = 'player1';
        const mockFighter = {
            player: { id: mockPlayerId },
            position: 0,
        };
        const mockAvailableIndexes = [1, 2, 3];
        const mockClient = {
            emit: jest.fn(),
        };
        const mockActiveGame = {
            playersCoord: [mockFighter],
        } as unknown as GameInstance;

        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(mockActiveGame);
        jest.spyOn(actionButtonService, 'getAvailableIndexes').mockReturnValue(mockAvailableIndexes);

        gateway.handleStartAction(mockClient, { roomId: mockRoomId, playerId: mockPlayerId });

        expect(activeGamesService.getActiveGame).toHaveBeenCalledWith(mockRoomId);
        expect(actionButtonService.getAvailableIndexes).toHaveBeenCalledWith(mockRoomId, mockFighter);
        expect(mockClient.emit).toHaveBeenCalledWith('startAction', mockAvailableIndexes);
    });

    it('should handle checkAction message', () => {
        const mockRoomId = 'room1';
        const mockPlayerId = 'player1';
        const mockFighter = {
            player: { id: mockPlayerId },
            position: 0,
        };
        const mockAvailableIndexes = [1, 2, 3];
        const mockClient = {
            emit: jest.fn(),
        };
        const mockActiveGame = {
            playersCoord: [mockFighter],
        } as unknown as GameInstance;

        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(mockActiveGame);
        jest.spyOn(actionButtonService, 'getAvailableIndexes').mockReturnValue(mockAvailableIndexes);

        gateway.handleCheckAction(mockClient, { roomId: mockRoomId, playerId: mockPlayerId });

        expect(activeGamesService.getActiveGame).toHaveBeenCalledWith(mockRoomId);
        expect(actionButtonService.getAvailableIndexes).toHaveBeenCalledWith(mockRoomId, mockFighter);
        expect(mockClient.emit).toHaveBeenCalledWith('checkValidAction', mockAvailableIndexes);
    });

    it('should handle winnerPlayer message', () => {
        const mockRoomId = 'room1';
        const mockPlayerId = 'player1';
        const mockFighter = {
            player: { id: mockPlayerId },
            position: 0,
        };
        const mockClient = {
            emit: jest.fn(),
        };
        const mockActiveGame = {
            playersCoord: [mockFighter],
        } as unknown as GameInstance;

        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(mockActiveGame);
        const setWinnerSpy = jest.spyOn(gateway['combatService'], 'setWinner');

        gateway.handleWinnerPlayer(mockClient, { roomId: mockRoomId, playerId: mockPlayerId });

        expect(activeGamesService.getActiveGame).toHaveBeenCalledWith(mockRoomId);
        expect(setWinnerSpy).toHaveBeenCalledWith(mockRoomId, mockFighter);
        expect(mockClient.emit).toHaveBeenCalledWith('winnerPlayer', {
            roomId: mockRoomId,
            playerId: mockPlayerId,
        });
    });

    it('should handle endCombat message', () => {
        const mockRoomId = 'room1';
        const mockPlayerId = 'player1';
        const mockFighter = {
            player: { id: mockPlayerId },
            position: 0,
        };
        const mockClient = {
            emit: jest.fn(),
        };
        const mockActiveGame = {
            playersCoord: [mockFighter],
        } as unknown as GameInstance;
        const mockFighters = {
            [mockRoomId]: 0,
        };

        gateway.server = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
        } as unknown as Server;

        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(mockActiveGame);
        jest.spyOn(gateway['combatService'], 'endCombat').mockReturnValue(mockFighters);

        gateway.handleEndCombat(mockClient, { roomId: mockRoomId, playerId: mockPlayerId });

        expect(activeGamesService.getActiveGame).toHaveBeenCalledWith(mockRoomId);
        expect(gateway['combatService'].endCombat).toHaveBeenCalledWith(mockRoomId, gateway.server, mockFighter);
        expect(gateway.server.to).toHaveBeenCalledWith(mockRoomId);
        expect(gateway.server.emit).toHaveBeenCalledWith('endCombat', mockFighters);
    });
});
