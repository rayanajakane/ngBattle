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

    it('should handle successful escape', () => {
        const client = { emit: jest.fn() };
        const data = { roomId: 'room1', playerId: 'player1' };
        const fighter = {
            player: {
                id: 'player1',
                name: 'Player One',
                isAdmin: true,
                avatar: 'string',
                attributes: {
                    health: 10,
                    speed: 'string',
                    attack: 10,
                    defense: 10,
                    dice: 'string',
                },
                isActive: true,
                abandoned: false,
                wins: 1,
            },
            position: 1,
        };
        const formattedTime = '12:00';
        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue({
            playersCoord: [fighter],
            roomId: '',
            game: undefined,
        });
        jest.spyOn(gateway['combatService'], 'escape').mockReturnValue([1, true]);
        jest.spyOn(gateway['actionHandlerService'], 'getCurrentTimeFormatted').mockReturnValue(formattedTime);
        jest.spyOn(gateway['combatService'], 'endCombat').mockReturnValue([]);

        gateway.handleEscape(client, data);

        expect(client.emit).toHaveBeenCalledWith('didEscape', { playerId: data.playerId, remainingEscapeChances: 1, hasEscaped: true });
        expect(gateway['server'].to(data.roomId).emit).toHaveBeenCalledWith('newLog', {
            date: formattedTime,
            message: `${fighter.player.name} a réussi à s'échapper du combat`,
            receiver: data.playerId,
            exclusive: true,
        });
    });

    it('should handle failed escape', () => {
        const client = { emit: jest.fn() };
        const data = { roomId: 'room1', playerId: 'player1' };
        const fighter = {
            player: {
                id: 'player1',
                name: 'Player One',
                isAdmin: true,
                avatar: 'string',
                attributes: {
                    health: 10,
                    speed: 'string',
                    attack: 10,
                    defense: 10,
                    dice: 'string',
                },
                isActive: true,
                abandoned: false,
                wins: 1,
            },
            position: 1,
        };
        const defender = fighter;
        const formattedTime = '12:00';
        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue({
            playersCoord: [fighter],
            roomId: '',
            game: undefined,
        });
        jest.spyOn(gateway['combatService'], 'escape').mockReturnValue([1, false]);
        jest.spyOn(gateway['actionHandlerService'], 'getCurrentTimeFormatted').mockReturnValue(formattedTime);
        jest.spyOn(gateway['combatService'], 'getFighters').mockReturnValue([defender]);

        gateway.handleEscape(client, data);

        expect(client.emit).toHaveBeenCalledWith('didEscape', { playerId: data.playerId, remainingEscapeChances: 1, hasEscaped: false });
        expect(gateway['server'].to(data.roomId).emit).toHaveBeenCalledWith('newLog', {
            date: formattedTime,
            message: `${fighter.player.name} a échoué à s'échapper du combat`,
            receiver: data.playerId,
            exclusive: true,
        });
        expect(gateway['server'].to(data.roomId).emit).toHaveBeenCalledWith('changeCombatTurn', defender.player.id);
    });
});
