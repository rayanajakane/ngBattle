import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from '../game.service';
import { MovementService } from '../movement/movement.service';
import { CombatService } from './combat.service';

describe('CombatService', () => {
    let service: CombatService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CombatService,
                ActiveGamesService,
                {
                    provide: ActiveGamesService,
                    useValue: {
                        getActiveGame: jest.fn(),
                    },
                },
                GameService,
                MovementService,
                {
                    provide: GameService,
                    useValue: {
                        getPlayersAround: jest.fn(),
                        getDoorsAround: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<CombatService>(CombatService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    it('should return true if player is in combat', () => {
        const roomId = 'room1';
        const player = { player: { id: 'player1' } } as any;
        const fighters = [{ player: { id: 'player1' } }, { player: { id: 'player2' } }] as any;

        service['fightersMap'].set(roomId, fighters);

        const result = service.isPlayerInCombat(roomId, player);
        expect(result).toBe(true);
    });

    it('should return false if player is not in combat', () => {
        const roomId = 'room1';
        const player = { player: { id: 'player3' } } as any;
        const fighters = [{ player: { id: 'player1' } }, { player: { id: 'player2' } }] as any;

        service['fightersMap'].set(roomId, fighters);

        const result = service.isPlayerInCombat(roomId, player);
        expect(result).toBe(false);
    });

    it('should return false if there are no fighters in the room', () => {
        const roomId = 'room1';
        const player = { player: { id: 'player1' } } as any;

        const result = service.isPlayerInCombat(roomId, player);
        expect(result).toBe(false);
    });

    it('should return fighters in the room', () => {
        const roomId = 'room1';
        const fighters = [{ player: { id: 'player1' } }, { player: { id: 'player2' } }] as any;

        service['fightersMap'].set(roomId, fighters);

        const result = service.getFighters(roomId);
        expect(result).toEqual(fighters);
    });

    it('should return undefined if there are no fighters in the room', () => {
        const roomId = 'room1';

        const result = service.getFighters(roomId);
        expect(result).toBeUndefined();
    });
});
