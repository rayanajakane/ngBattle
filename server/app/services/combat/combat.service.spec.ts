import { GameInstance } from '@app/data-structures/game-instance';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { PlayerCoord } from '@common/player';
import { TileTypes } from '@common/tile-types';
import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from '../game.service';
import { MovementService } from '../movement/movement.service';
import { CombatService } from './combat.service';

describe('CombatService', () => {
    let service: CombatService;
    let activeGamesService: ActiveGamesService;
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
        activeGamesService = module.get<ActiveGamesService>(ActiveGamesService);
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
    it('should return a number between 1 and the dice size when throwDice is called', () => {
        const diceSize = 6;
        const result = service['throwDice'](diceSize);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(diceSize);
    });

    it('should return different numbers when throwDice is called multiple times', () => {
        const diceSize = 6;
        const results = new Set();
        for (let i = 0; i < 100; i++) {
            results.add(service['throwDice'](diceSize));
        }
        expect(results.size).toBeGreaterThan(1);
    });

    it('should reset health to the original health value', () => {
        const fighter = { player: { attributes: { health: 100, currentHealth: 50 } } } as any;
        service['resetHealth'](fighter);
        expect(fighter.player.attributes.currentHealth).toBe(100);
    });

    it('should reset attack to the original attack value', () => {
        const fighter = { player: { attributes: { attack: 20, currentAttack: 10 } } } as any;
        service['resetAttack'](fighter);
        expect(fighter.player.attributes.currentAttack).toBe(20);
    });

    it('should reset defense to the original defense value', () => {
        const fighter = { player: { attributes: { defense: 30, currentDefense: 15 } } } as any;
        service['resetDefense'](fighter);
        expect(fighter.player.attributes.currentDefense).toBe(30);
    });

    it('should reset speed to the original speed value', () => {
        const fighter = { player: { attributes: { speed: 40, currentSpeed: 20 } } } as any;
        service['resetSpeed'](fighter);
        expect(fighter.player.attributes.currentSpeed).toBe(40);
    });
    it('should return true if player is on ice', () => {
        const roomId = 'room1';
        const player = { position: 0 } as PlayerCoord;
        const game = { map: [{ idx: 1, tileType: TileTypes.ICE, item: '', hasPlayer: true }] };
        const activeGame = { game } as GameInstance;

        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(activeGame);

        const result = service['isPlayerOnIce'](roomId, player);
        expect(result).toBe(true);
    });

    it('should return false if player is not on ice', () => {
        const roomId = 'room1';
        const player = { position: 0 } as PlayerCoord;
        const game = { map: [{ idx: 0, tileType: TileTypes.BASIC, item: '', hasPlayer: true }] };
        const activeGame = { game } as GameInstance;

        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(activeGame as GameInstance);

        const result = service['isPlayerOnIce'](roomId, player);
        expect(result).toBe(false);
    });
    it('should return true if player can escape', () => {
        const roomId = 'room1';
        const player = { player: { attributes: { escape: 1 } } } as any;

        jest.spyOn(service, 'isPlayerInCombat').mockReturnValue(true);
        jest.spyOn(Math, 'random').mockReturnValue(0.1); // Mock random to be less than ESCAPE_PROBABILITY

        const result = service['canPlayerEscape'](roomId, player);
        expect(result).toBe(true);
    });

    it('should return false if player cannot escape due to random number', () => {
        const roomId = 'room1';
        const player = { player: { attributes: { escape: 1 } } } as any;

        jest.spyOn(service, 'isPlayerInCombat').mockReturnValue(true);
        jest.spyOn(Math, 'random').mockReturnValue(0.9); // Mock random to be greater than ESCAPE_PROBABILITY

        const result = service['canPlayerEscape'](roomId, player);
        expect(result).toBe(false);
    });

    it('should return false if player is not in combat', () => {
        const roomId = 'room1';
        const player = { player: { attributes: { escape: 1 } } } as any;

        jest.spyOn(service, 'isPlayerInCombat').mockReturnValue(false);

        const result = service['canPlayerEscape'](roomId, player);
        expect(result).toBe(false);
    });
    it('should call resetHealth, resetAttack, resetDefense, and resetSpeed if player is in combat', () => {
        const roomId = 'room1';
        const fighter = { player: { id: 'player1' } } as any;

        jest.spyOn(service, 'isPlayerInCombat').mockReturnValue(true);
        jest.spyOn(service as any, 'resetHealth').mockImplementation();
        jest.spyOn(service as any, 'resetAttack').mockImplementation();
        jest.spyOn(service as any, 'resetDefense').mockImplementation();
        jest.spyOn(service as any, 'resetSpeed').mockImplementation();

        const resetHealthSpy = jest.spyOn(service as any, 'resetHealth');
        const resetAttackSpy = jest.spyOn(service as any, 'resetAttack');
        const resetDefenseSpy = jest.spyOn(service as any, 'resetDefense');
        const resetSpeedSpy = jest.spyOn(service as any, 'resetSpeed');

        service['resetAllAttributes'](roomId, fighter);

        expect(resetHealthSpy).toHaveBeenCalledWith(fighter);
        expect(resetAttackSpy).toHaveBeenCalledWith(fighter);
        expect(resetDefenseSpy).toHaveBeenCalledWith(fighter);
        expect(resetSpeedSpy).toHaveBeenCalledWith(fighter);
    });

    it('should not call resetHealth, resetAttack, resetDefense, and resetSpeed if player is not in combat', () => {
        const roomId = 'room1';
        const fighter = { player: { id: 'player1' } } as any;

        jest.spyOn(service, 'isPlayerInCombat').mockReturnValue(false);
        const resetHealthSpy = jest.spyOn(service as any, 'resetHealth');
        const resetAttackSpy = jest.spyOn(service as any, 'resetAttack');
        const resetDefenseSpy = jest.spyOn(service as any, 'resetDefense');
        const resetSpeedSpy = jest.spyOn(service as any, 'resetSpeed');

        service['resetAllAttributes'](roomId, fighter);

        expect(resetHealthSpy).not.toHaveBeenCalled();
        expect(resetAttackSpy).not.toHaveBeenCalled();
        expect(resetDefenseSpy).not.toHaveBeenCalled();
        expect(resetSpeedSpy).not.toHaveBeenCalled();
    });
    it('should return the player with the highest speed as the first player', () => {
        const roomId = 'room1';
        const fighters = [{ player: { id: 'player1', attributes: { speed: 10 } } }, { player: { id: 'player2', attributes: { speed: 20 } } }] as any;

        service['fightersMap'].set(roomId, fighters);

        const result = service.whoIsFirstPlayer(roomId);
        expect(result).toEqual(fighters[1]);
    });

    it('should return the attacker if both players have the same speed', () => {
        const roomId = 'room1';
        const fighters = [{ player: { id: 'player1', attributes: { speed: 20 } } }, { player: { id: 'player2', attributes: { speed: 20 } } }] as any;

        service['fightersMap'].set(roomId, fighters);

        const result = service.whoIsFirstPlayer(roomId);
        expect(result).toEqual(fighters[0]);
    });
});
