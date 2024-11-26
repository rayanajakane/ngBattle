import { GameInstance } from '@app/data-structures/game-instance';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { CombatService } from '@app/services/combat/combat.service';
import { GameService } from '@app/services/game.service';
import { MovementService } from '@app/services/movement/movement.service';
import { CombatAction } from '@common/combat-actions';
import { PlayerCoord } from '@common/player';
import { TileTypes } from '@common/tile-types';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'socket.io';
import { ActionHandlerService } from '../action-handler/action-handler.service';
import { ActionService } from '../action/action.service';
import { DebugModeService } from '../debug-mode/debug-mode.service';
import { ICE_PENALTY } from './constants';

/* eslint-disable */
describe('CombatService', () => {
    let service: CombatService;
    let activeGamesService: ActiveGamesService;
    let debugModeService: DebugModeService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CombatService,
                {
                    provide: DebugModeService,
                    useValue: {
                        isDebugMode: jest.fn(),
                    },
                },
                ActionHandlerService,
                {
                    provide: ActionHandlerService,
                    useValue: {
                        handleCombatAction: jest.fn(),
                        handleLogicAction: jest.fn(),
                    },
                },
                ActiveGamesService,
                ActionService,
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
        debugModeService = module.get<DebugModeService>(DebugModeService);
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
    //
    it('should apply ice disadvantage to player attributes if player is on ice', () => {
        const roomId = 'room1';
        const player = { player: { attributes: { currentAttack: 20, currentDefense: 30 } }, position: 0 } as any;
        const game = { map: [{ idx: 0, tileType: TileTypes.ICE, item: '', hasPlayer: true }] };
        const activeGame = { game } as GameInstance;

        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(activeGame);

        service['applyIceDisadvantage'](roomId, player);

        expect(player.player.attributes.currentAttack).toBe(20 - ICE_PENALTY);
        expect(player.player.attributes.currentDefense).toBe(30 - ICE_PENALTY);
    });
    it('should not set escape tokens if there are not enough fighters in the room', () => {
        const roomId = 'room1';
        const fighters = [{ player: { id: 'player1', attributes: { escape: 0 } } }] as any;

        service['fightersMap'].set(roomId, fighters);

        service['setEscapeTokens'](roomId);

        fighters.forEach((fighter) => {
            expect(fighter.player.attributes.escape).toBe(0);
        });
    });
    it('should set escape tokens for each fighter in the room', () => {
        const roomId = 'room1';
        const fighters = [
            { player: { id: 'player1', attributes: { escape: 0 } } },
            { player: { id: 'player2', attributes: { escape: 0 } } },
        ] as unknown as PlayerCoord[];

        service['fightersMap'].set(roomId, fighters);

        service['setEscapeTokens'](roomId);

        fighters.forEach((fighter) => {
            expect(fighter.player.attributes.escape).toBeGreaterThan(0);
        });
    });
    it("should return [escape tokens, false] if it is not the player's turn or player has no escape tokens", () => {
        const roomId = 'room1';
        const player = { player: { id: 'player1', attributes: { escape: 0 } } } as any;
        const server = {} as Server;

        jest.spyOn(service, 'getCurrentTurnPlayer').mockReturnValue({ player: { id: 'player2' } } as any);

        const result = service.escape(roomId, player, server);
        expect(result).toEqual([0, false]);
    });

    it('should return [escape tokens, false] if player is in combat but cannot escape', () => {
        const roomId = 'room1';
        const player = { player: { id: 'player1', attributes: { escape: 1 } } } as any;
        const server = {} as Server;

        jest.spyOn(service, 'getCurrentTurnPlayer').mockReturnValue(player);
        jest.spyOn(service, 'isPlayerInCombat').mockReturnValue(true);
        jest.spyOn(service as any, 'canPlayerEscape').mockReturnValue(false);
        const endCombatTurnSpy = jest.spyOn(service, 'endCombatTurn').mockImplementation();

        const result = service.escape(roomId, player, server);
        expect(result).toEqual([0, false]);
        expect(endCombatTurnSpy).toHaveBeenCalledWith(roomId, player, server);
    });

    it('should return [escape tokens, true] if player is in combat and can escape', () => {
        const roomId = 'room1';
        const player = { player: { id: 'player1', attributes: { escape: 1 } } } as any;
        const server = {} as Server;

        jest.spyOn(service, 'getCurrentTurnPlayer').mockReturnValue(player);
        jest.spyOn(service, 'isPlayerInCombat').mockReturnValue(true);
        jest.spyOn(service as any, 'canPlayerEscape').mockReturnValue(true);

        const result = service.escape(roomId, player, server);
        expect(result).toEqual([0, true]);
    });

    it('should call endCombatTurn if player cannot escape', () => {
        const roomId = 'room1';
        const player = { player: { id: 'player1', attributes: { escape: 1 } } } as any;
        const server = {} as Server;

        jest.spyOn(service, 'getCurrentTurnPlayer').mockReturnValue(player);
        jest.spyOn(service, 'isPlayerInCombat').mockReturnValue(true);
        jest.spyOn(service as any, 'canPlayerEscape').mockReturnValue(false);
        const endCombatTurnSpy = jest.spyOn(service, 'endCombatTurn').mockImplementation();

        service.escape(roomId, player, server);
        expect(endCombatTurnSpy).toHaveBeenCalledWith(roomId, player, server);
    });

    it('should not call endCombatTurn if player can escape', () => {
        const roomId = 'room1';
        const player = { player: { id: 'player1', attributes: { escape: 1 } } } as any;
        const server = {} as Server;

        jest.spyOn(service, 'getCurrentTurnPlayer').mockReturnValue(player);
        jest.spyOn(service, 'isPlayerInCombat').mockReturnValue(true);
        jest.spyOn(service as any, 'canPlayerEscape').mockReturnValue(true);
        const endCombatTurnSpy = jest.spyOn(service, 'endCombatTurn').mockImplementation();

        service.escape(roomId, player, server);
        expect(endCombatTurnSpy).not.toHaveBeenCalled();
    });
    it('should increment wins if player is in combat', () => {
        const roomId = 'room1';
        const player = { player: { id: 'player1', wins: 0 } } as any;

        jest.spyOn(service, 'isPlayerInCombat').mockReturnValue(true);

        service['setWinner'](roomId, player);
        expect(player.player.wins).toBe(1);
    });

    it('should not increment wins if player is not in combat', () => {
        const roomId = 'room1';
        const player = { player: { id: 'player1', wins: 0 } } as any;

        jest.spyOn(service, 'isPlayerInCombat').mockReturnValue(false);

        service['setWinner'](roomId, player);
        expect(player.player.wins).toBe(0);
    });
    it('should start combat turn and set the current turn index', () => {
        const roomId = 'room1';
        const player = { player: { id: 'player1', attributes: { escape: 1 } } } as any;
        const gameInstance = {
            combatTimer: {
                startTimer: jest.fn(),
            },
        } as any;

        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance);
        const startTimerSpy = jest.spyOn(gameInstance.combatTimer, 'startTimer');
        const setCurrentTurnMapSpy = jest.spyOn(service['currentTurnMap'], 'set');

        service['fightersMap'].set(roomId, [player]);

        service.startCombatTurn(roomId, player);

        expect(startTimerSpy).toHaveBeenCalledWith(true);
        expect(setCurrentTurnMapSpy).toHaveBeenCalledWith(roomId, 0);
    });
    it('should call attack method when combatAction is ATTACK', () => {
        const roomId = 'room1';
        const player = { player: { id: 'player1' } } as any;
        const combatAction = CombatAction.ATTACK;
        const server = {} as Server;

        jest.spyOn(service['fightersMap'], 'get').mockReturnValue([{ player: { id: 'player1' } }, { player: { id: 'player2' } }] as any);
        const attackSpy = jest.spyOn(service, 'attack').mockImplementation();

        service.startCombatAction(roomId, player, combatAction, server);

        expect(attackSpy).toHaveBeenCalledWith(roomId, player, expect.any(Object), server);
    });

    it('should call escape method when combatAction is ESCAPE', () => {
        const roomId = 'room1';
        const player = { player: { id: 'player1' } } as any;
        const combatAction = CombatAction.ESCAPE;
        const server = {} as Server;

        jest.spyOn(service['fightersMap'], 'get').mockReturnValue([{ player: { id: 'player1' } }, { player: { id: 'player2' } }] as any);
        const escapeSpy = jest.spyOn(service, 'escape').mockImplementation();

        service.startCombatAction(roomId, player, combatAction, server);

        expect(escapeSpy).toHaveBeenCalledWith(roomId, player, server);
    });
    it('should reset the combat timer and set the new turn index when endCombatTurn is called', () => {
        const roomId = 'room1';
        const player = { player: { id: 'player1' } } as any;
        const gameInstance = {
            combatTimer: {
                resetTimer: jest.fn(),
            },
        } as any;

        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance);
        const resetTimerSpy = jest.spyOn(gameInstance.combatTimer, 'resetTimer');
        const setCurrentTurnMapSpy = jest.spyOn(service['currentTurnMap'], 'set');

        const fighters = [{ player: { id: 'player1' } }, { player: { id: 'player2' } }] as any;
        service['fightersMap'].set(roomId, fighters);
        service['currentTurnMap'].set(roomId, 0);

        service.endCombatTurn(roomId, player, {} as Server);

        expect(resetTimerSpy).toHaveBeenCalled();
        expect(setCurrentTurnMapSpy).toHaveBeenCalledWith(roomId, 1);
    });

    it('should not set new turn index if player is not in combat', () => {
        const roomId = 'room1';
        const player = { player: { id: 'player1' } } as any;
        const gameInstance = {
            combatTimer: {
                resetTimer: jest.fn(),
            },
        } as any;

        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance);
        const resetTimerSpy = jest.spyOn(gameInstance.combatTimer, 'resetTimer');
        const setCurrentTurnMapSpy = jest.spyOn(service['currentTurnMap'], 'set');

        jest.spyOn(service, 'isPlayerInCombat').mockReturnValue(false);

        service.endCombatTurn(roomId, player, {} as Server);

        expect(resetTimerSpy).toHaveBeenCalled();
        expect(setCurrentTurnMapSpy).not.toHaveBeenCalled();
    });
    it('should return the current turn player if fighters are present', () => {
        const roomId = 'room1';
        const fighters = [{ player: { id: 'player1' } }, { player: { id: 'player2' } }] as any;

        service['fightersMap'].set(roomId, fighters);
        service['currentTurnMap'].set(roomId, 1);

        const result = service.getCurrentTurnPlayer(roomId);
        expect(result).toEqual(fighters[1]);
    });

    it('should return the first fighter if current turn index is not set', () => {
        const roomId = 'room1';
        const fighters = [{ player: { id: 'player1' } }, { player: { id: 'player2' } }] as any;

        service['fightersMap'].set(roomId, fighters);

        const result = service.getCurrentTurnPlayer(roomId);
        expect(result).toEqual(fighters[0]);
    });

    it('should return undefined if there are no fighters in the room', () => {
        const roomId = 'room1';

        const result = service.getCurrentTurnPlayer(roomId);
        expect(result).toBeUndefined();
    });
    it('should return true and correct dice rolls if attack is successful', () => {
        const attacker = { player: { attributes: { currentAttack: 10, dice: 'attack' } } } as any;
        const defender = { player: { attributes: { currentDefense: 5, dice: 'defense' } } } as any;

        jest.spyOn(service as any, 'throwDice')
            .mockReturnValueOnce(6)
            .mockReturnValueOnce(3);

        jest.spyOn(debugModeService, 'isDebugModeActive').mockReturnValue(false);

        const [isAttackSuccessful, diceRolls] = service.checkAttackSuccessful(attacker, defender);

        expect(isAttackSuccessful).toBe(true);
        expect(diceRolls).toEqual([6, 3]);
    });

    it('should return false and correct dice rolls if attack is not successful', () => {
        const attacker = { player: { attributes: { currentAttack: 5, dice: 'attack' } } } as any;
        const defender = { player: { attributes: { currentDefense: 10, dice: 'defense' } } } as any;

        jest.spyOn(service as any, 'throwDice')
            .mockReturnValueOnce(3)
            .mockReturnValueOnce(6);

        const [isAttackSuccessful, diceRolls] = service.checkAttackSuccessful(attacker, defender);

        expect(isAttackSuccessful).toBe(false);
        expect(diceRolls).toEqual([3, 6]);
    });

    it('should return true if attacker has boosted attack dice', () => {
        const attacker = { player: { attributes: { currentAttack: 10, dice: 'attack' } } } as any;
        const defender = { player: { attributes: { currentDefense: 5 } } } as any;

        jest.spyOn(service as any, 'throwDice')
            .mockReturnValueOnce(6)
            .mockReturnValueOnce(3);

        const [isAttackSuccessful, diceRolls] = service.checkAttackSuccessful(attacker, defender);

        expect(isAttackSuccessful).toBe(true);
        expect(diceRolls).toEqual([6, 3]);
    });

    it('should return false if defender has boosted defense dice', () => {
        const attacker = { player: { attributes: { currentAttack: 5 } } } as any;
        const defender = { player: { attributes: { currentDefense: 10, dice: 'defense' } } } as any;

        jest.spyOn(service as any, 'throwDice')
            .mockReturnValueOnce(3)
            .mockReturnValueOnce(6);

        const [isAttackSuccessful, diceRolls] = service.checkAttackSuccessful(attacker, defender);

        expect(isAttackSuccessful).toBe(false);
        expect(diceRolls).toEqual([3, 6]);
    });
    it('should call setWinner, resetAllAttributes, teleportPlayerToHome, and endCombat when killPlayer is called', () => {
        const roomId = 'room1';
        const player = { player: { id: 'player1' } } as any;
        const playerKiller = { player: { id: 'player2' } } as any;
        const fighters = [player, playerKiller] as any;
        const server = {} as Server;

        service['fightersMap'].set(roomId, fighters);

        const setWinnerSpy = jest.spyOn(service as any, 'setWinner').mockImplementation();
        const resetAllAttributesSpy = jest.spyOn(service as any, 'resetAllAttributes').mockImplementation();
        const teleportPlayerToHomeSpy = jest.spyOn(service as any, 'teleportPlayerToHome').mockImplementation();
        const endCombatSpy = jest.spyOn(service as any, 'endCombat').mockReturnValue(fighters);

        const result = service['killPlayer'](roomId, player, server);

        expect(setWinnerSpy).toHaveBeenCalledWith(roomId, playerKiller);
        expect(resetAllAttributesSpy).toHaveBeenCalledWith(roomId, player);
        expect(teleportPlayerToHomeSpy).toHaveBeenCalledWith(roomId, player);
        expect(resetAllAttributesSpy).toHaveBeenCalledWith(roomId, playerKiller);
        expect(endCombatSpy).toHaveBeenCalledWith(roomId, playerKiller, server);
        expect(result).toEqual([playerKiller, player, fighters]);
    });
    it('should return [null, null, []] if playerKiller or playerKilled is not found', () => {
        const roomId = 'room1';
        const player = { player: { id: 'player1' } } as any;
        const server = {} as Server;

        service['fightersMap'].set(roomId, [player]);

        const result = service['killPlayer'](roomId, player, server);

        expect(result).toEqual([null, null, []]);
    });
    it('should disperse killed player objects to valid positions', () => {
        const roomId = 'room1';
        const player = { position: 0, player: { inventory: ['item1', 'item2'] } } as any;
        const game = {
            map: [
                { idx: 0, tileType: TileTypes.BASIC, item: '', hasPlayer: true },
                { idx: 1, tileType: TileTypes.BASIC, item: '', hasPlayer: false },
            ],
        };
        const activeGame = { game } as GameInstance;

        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(activeGame);
        jest.spyOn(service as any, 'verifyPossibleObjectsPositions').mockReturnValue([1]);

        service['disperseKilledPlayerObjects'](roomId, player);

        expect(activeGame.game.map[0].item).toBe('item2');
    });
    it('should teleport player to home if home position is not occupied', () => {
        const roomId = 'room1';
        const player = { position: 0, player: { homePosition: 1 } } as any;
        const game = {
            map: [
                { idx: 0, tileType: TileTypes.BASIC, item: '', hasPlayer: true },
                { idx: 1, tileType: TileTypes.BASIC, item: '', hasPlayer: false },
            ],
        };
        const activeGame = { game } as GameInstance;

        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(activeGame);

        service['teleportPlayerToHome'](roomId, player);

        expect(activeGame.game.map[0].hasPlayer).toBe(false);
        expect(activeGame.game.map[1].hasPlayer).toBe(true);
        expect(player.position).toBe(1);
    });

    it('should teleport player to a nearby position if home position is occupied', () => {
        const roomId = 'room1';
        const player = { position: 0, player: { homePosition: 1 } } as any;
        const game = {
            map: [
                { idx: 0, tileType: TileTypes.BASIC, item: '', hasPlayer: true },
                { idx: 1, tileType: TileTypes.BASIC, item: '', hasPlayer: true },
                { idx: 2, tileType: TileTypes.BASIC, item: '', hasPlayer: false },
            ],
        };
        const activeGame = { game } as GameInstance;

        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(activeGame);
        jest.spyOn(service as any, 'verifyPossibleObjectsPositions').mockReturnValue([1]);

        service['teleportPlayerToHome'](roomId, player);

        expect(activeGame.game.map[0].hasPlayer).toBe(false);
        expect(activeGame.game.map[2].hasPlayer).toBe(true);
        expect(player.position).toBe(2);
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
    it('should return an array of possible object positions', () => {
        const roomId = 'room1';
        const position = 20;
        const mapSize = '10';
        const map = Array(100)
            .fill(null)
            .map((_, idx) => ({ idx, tileType: TileTypes.BASIC, item: '', hasPlayer: false }));
        const game = {
            mapSize: mapSize,
            map: map,
        };
        const activeGame = { game } as unknown as GameInstance;

        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(activeGame);

        const result = service['verifyPossibleObjectsPositions'](roomId, position);

        expect(result).toEqual([1, -1, -10, 10]);
    });
    it('should return an array of possible object positions', () => {
        const roomId = 'room1';
        const position = 20;
        const mapSize = '10';
        const map = Array(100)
            .fill(null)
            .map((_, idx) => ({ idx, tileType: TileTypes.BASIC, item: '', hasPlayer: false }));
        const game = {
            mapSize: mapSize,
            map: map,
        };
        const activeGame = { game } as unknown as GameInstance;

        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(activeGame);

        const result = service['verifyPossibleObjectsPositions'](roomId, position);

        expect(result).toEqual([1, -1, -10, 10]);
    });

    it('should double the position and add it to verifiedPositions if the tileType is not WALL or DOORCLOSED', () => {
        const roomId = 'room1';
        const position = 11;
        const mapSize = '10';
        const map = Array(100)
            .fill(null)
            .map((_, idx) => ({ idx, tileType: TileTypes.BASIC, item: '', hasPlayer: false }));
        map[0] = { idx: 0, tileType: TileTypes.WALL, item: '', hasPlayer: false };
        map[1] = { idx: 1, tileType: TileTypes.WALL, item: '', hasPlayer: false };
        map[2] = { idx: 2, tileType: TileTypes.WALL, item: '', hasPlayer: false };
        map[10] = { idx: 10, tileType: TileTypes.WALL, item: '', hasPlayer: false };
        map[12] = { idx: 12, tileType: TileTypes.WALL, item: '', hasPlayer: false };
        map[20] = { idx: 20, tileType: TileTypes.WALL, item: '', hasPlayer: false };
        map[21] = { idx: 22, tileType: TileTypes.DOORCLOSED, item: '', hasPlayer: false };
        map[22] = { idx: 22, tileType: TileTypes.WALL, item: '', hasPlayer: false };

        const game = {
            mapSize: mapSize,
            map: map,
        };
        const activeGame = { game } as unknown as GameInstance;

        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(activeGame);

        const verifiedPositions: number[] = service['verifyPossibleObjectsPositions'](roomId, position);
        console.log(verifiedPositions);

        expect(verifiedPositions).toEqual([2, 20]);
    });

    it('should initialize combat correctly when fighters length is equal to COMBAT_FIGHTERS_NUMBER', () => {
        const roomId = 'room1';
        const fighters = [
            { player: { id: 'player1', attributes: { health: 100, attack: 20, defense: 30, speed: 40 } } },
            { player: { id: 'player2', attributes: { health: 90, attack: 25, defense: 35, speed: 45 } } },
        ] as unknown as PlayerCoord[];

        const gameInstance = {
            turnTimer: { pauseTimer: jest.fn() },
            combatTimer: { startTimer: jest.fn() },
        } as any;

        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance);
        jest.spyOn(service, 'applyIceDisadvantage').mockImplementation();
        jest.spyOn(service, 'setEscapeTokens').mockImplementation();
        jest.spyOn(service, 'whoIsFirstPlayer').mockReturnValue(fighters[1]);
        jest.spyOn(service['fightersMap'], 'set');
        jest.spyOn(service['currentTurnMap'], 'set');

        const result = service.startCombat(roomId, fighters);

        expect(gameInstance.turnTimer.pauseTimer).toHaveBeenCalled();
        expect(service.applyIceDisadvantage).toHaveBeenCalledTimes(2);
        expect(service.setEscapeTokens).toHaveBeenCalledWith(roomId);
        expect(gameInstance.combatTimer.startTimer).toHaveBeenCalledWith(true);
        expect(service['fightersMap'].set).toHaveBeenCalledWith(roomId, fighters);
        expect(service['currentTurnMap'].set).toHaveBeenCalledWith(roomId, 1);
        expect(result).toEqual([fighters[1], fighters[0]]);
    });

    it('should not initialize combat if fighters length is not equal to COMBAT_FIGHTERS_NUMBER', () => {
        const roomId = 'room1';
        const fighters = [{ player: { id: 'player1', attributes: { health: 100, attack: 20, defense: 30, speed: 40 } } }] as unknown as PlayerCoord[];

        const gameInstance = {
            turnTimer: { pauseTimer: jest.fn() },
            combatTimer: { startTimer: jest.fn() },
        } as any;

        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance);

        const result = service.startCombat(roomId, fighters);

        expect(gameInstance.turnTimer.pauseTimer).toHaveBeenCalled();
        expect(result).toBeUndefined();
    });

    it('should set default attributes if current attributes are undefined', () => {
        const roomId = 'room1';
        const fighters = [
            { player: { id: 'player1', attributes: { health: 100, attack: 20, defense: 30, speed: 40 } } },
            { player: { id: 'player2', attributes: { health: 90, attack: 25, defense: 35, speed: 45 } } },
        ] as unknown as PlayerCoord[];

        fighters[0].player.attributes.currentHealth = undefined;
        fighters[0].player.attributes.currentAttack = undefined;
        fighters[0].player.attributes.currentDefense = undefined;
        fighters[0].player.attributes.currentSpeed = undefined;

        const gameInstance = {
            turnTimer: { pauseTimer: jest.fn() },
            combatTimer: { startTimer: jest.fn() },
        } as any;

        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance);
        jest.spyOn(service, 'applyIceDisadvantage').mockImplementation();
        jest.spyOn(service, 'setEscapeTokens').mockImplementation();
        jest.spyOn(service, 'whoIsFirstPlayer').mockReturnValue(fighters[1]);
        jest.spyOn(service['fightersMap'], 'set');
        jest.spyOn(service['currentTurnMap'], 'set');

        service.startCombat(roomId, fighters);

        expect(fighters[0].player.attributes.currentHealth).toBe(100);
        expect(fighters[0].player.attributes.currentAttack).toBe(20);
        expect(fighters[0].player.attributes.currentDefense).toBe(30);
        expect(fighters[0].player.attributes.currentSpeed).toBe(40);
    });
    it('should end combat and remove player from fighters map', () => {
        const roomId = 'room1';
        const server = {} as Server;
        const playerToRemove = {
            player: { id: 'player1', attributes: { health: 100, attack: 20, defense: 30, speed: 40 } },
        } as unknown as PlayerCoord;
        const fighters = [
            { player: { id: 'player1', attributes: { health: 100, attack: 20, defense: 30, speed: 40 } } },
            { player: { id: 'player2', attributes: { health: 90, attack: 25, defense: 35, speed: 45 } } },
        ] as unknown as PlayerCoord[];

        const gameInstance = {
            turnTimer: { resumeTimer: jest.fn() },
            combatTimer: { stopTimer: jest.fn(), resetTimer: jest.fn() },
        } as any;

        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance);
        jest.spyOn(service['fightersMap'], 'get').mockReturnValue(fighters);
        jest.spyOn(service['fightersMap'], 'set');
        jest.spyOn(service['fightersMap'], 'delete');
        jest.spyOn(service['currentTurnMap'], 'delete');

        service.endCombat(roomId, server, playerToRemove);

        expect(gameInstance.turnTimer.resumeTimer).toHaveBeenCalled();
        expect(service['fightersMap'].get).toHaveBeenCalledWith(roomId);
        expect(service['fightersMap'].delete).toHaveBeenCalled();
        expect(service['currentTurnMap'].delete).toHaveBeenCalledWith(roomId);
    });
    it('should end combat and remove player from fighters map if fighter length is 1 ', () => {
        const roomId = 'room1';
        const server = {} as Server;
        const playerToRemove = {
            player: { id: 'player1', attributes: { health: 100, attack: 20, defense: 30, speed: 40 } },
        } as unknown as PlayerCoord;
        const fighters = [{ player: { id: 'player1', attributes: { health: 100, attack: 20, defense: 30, speed: 40 } } }] as unknown as PlayerCoord[];

        const gameInstance = {
            turnTimer: { resumeTimer: jest.fn() },
            combatTimer: { stopTimer: jest.fn(), resetTimer: jest.fn() },
        } as any;

        jest.spyOn(service as any, 'setWinner').mockImplementation();
        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance);
        jest.spyOn(service['fightersMap'], 'get').mockReturnValue(fighters);
        jest.spyOn(service['fightersMap'], 'set');
        jest.spyOn(service['fightersMap'], 'delete');
        jest.spyOn(service['currentTurnMap'], 'delete');

        service.endCombat(roomId, server, playerToRemove);
        expect(service['setWinner']).toHaveBeenCalled();
        expect(gameInstance.turnTimer.resumeTimer).toHaveBeenCalled();
        expect(service['fightersMap'].get).toHaveBeenCalledWith(roomId);
        expect(service['fightersMap'].delete).toHaveBeenCalled();
        expect(service['currentTurnMap'].delete).toHaveBeenCalledWith(roomId);
    });
});
