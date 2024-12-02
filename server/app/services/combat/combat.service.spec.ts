import { GameInstance } from '@app/data-structures/game-instance';
import { ActionHandlerService } from '@app/services/action-handler/action-handler.service';
import { ActionService } from '@app/services/action/action.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { CombatService } from '@app/services/combat/combat.service';
import { DebugModeService } from '@app/services/debug-mode/debug-mode.service';
import { GameService } from '@app/services/game.service';
import { MovementService } from '@app/services/movement/movement.service';
import { PlayerCoord } from '@common/player';
import { TileTypes } from '@common/tile-types';
import { Test, TestingModule } from '@nestjs/testing';
import { ActionButtonService } from '../action-button/action-button.service';
import { CombatHandlerService } from '../combat-handler/combat-handler.service';
import { InventoryService } from '../inventory/inventory.service';
import { LogSenderService } from '../log-sender/log-sender.service';
import { VirtualPlayerService } from '../virtual-player/virtual-player.service';
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
                VirtualPlayerService,
                CombatHandlerService,
                LogSenderService,
                ActionButtonService,
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
                InventoryService,
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

        expect(verifiedPositions).toEqual([2, 20]);
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

    it("should not allow escape if it is not the player's turn or escape attribute is less than 1", () => {
        const roomId = 'room1';
        const player = { player: { id: 'player1', attributes: { escape: 0 } } } as unknown as PlayerCoord;

        jest.spyOn(service, 'getCurrentTurnPlayer').mockReturnValue({ player: { id: 'player2' } } as PlayerCoord);

        const result = service.escape(roomId, player);

        expect(result).toEqual([0, false]);
    });

    it('should not allow escape if player is in combat and cannot escape', () => {
        const roomId = 'room1';
        const player = { player: { id: 'player1', attributes: { escape: 1 } } } as unknown as PlayerCoord;

        jest.spyOn(service, 'getCurrentTurnPlayer').mockReturnValue(player);
        jest.spyOn(service as any, 'canPlayerEscape').mockReturnValue(false);
        jest.spyOn(service, 'isPlayerInCombat').mockReturnValue(true);
        jest.spyOn(service, 'endCombatTurn').mockImplementation();

        const result = service.escape(roomId, player);

        expect(result).toEqual([0, false]);
        expect(service.endCombatTurn).toHaveBeenCalledWith(roomId, player);
    });

    it('should allow escape if player is in combat and can escape', () => {
        const roomId = 'room1';
        const player = { player: { id: 'player1', attributes: { escape: 1 }, stats: { escapeCount: 0 } } } as unknown as PlayerCoord;

        jest.spyOn(service, 'getCurrentTurnPlayer').mockReturnValue(player);
        jest.spyOn(service as any, 'canPlayerEscape').mockReturnValue(true);
        jest.spyOn(service, 'isPlayerInCombat').mockReturnValue(true);

        const result = service.escape(roomId, player);

        expect(result).toEqual([0, true]);
        expect(player.player.stats.escapeCount).toBe(1);
    });

    it('should increment wins and victoryCount if player is in combat', () => {
        const roomId = 'room1';
        const player = { player: { id: 'player1', wins: 0, stats: { victoryCount: 0 } } } as any;
        const fighters = [{ player: { id: 'player1' } }, { player: { id: 'player2' } }] as any;

        service['fightersMap'].set(roomId, fighters);
        jest.spyOn(service, 'isPlayerInCombat').mockReturnValue(true);

        service.setWinner(roomId, player);

        expect(player.player.wins).toBe(1);
        expect(player.player.stats.victoryCount).toBe(1);
    });

    it('should not increment wins and victoryCount if player is not in combat', () => {
        const roomId = 'room1';
        const player = { player: { id: 'player1', wins: 0, stats: { victoryCount: 0 } } } as any;

        jest.spyOn(service, 'isPlayerInCombat').mockReturnValue(false);

        service.setWinner(roomId, player);

        expect(player.player.wins).toBe(0);
        expect(player.player.stats.victoryCount).toBe(0);
    });

    it('should return diceSize if fighter has AF2 item and random is greater than 0.5', () => {
        const diceSize = 6;
        const fighter = { player: { id: 'player1' } } as any;

        jest.spyOn(service['inventoryService'], 'hasAF2Item').mockReturnValue(true);
        jest.spyOn(Math, 'random').mockReturnValue(0.6);

        const result = service['throwDice'](diceSize, fighter);
        expect(result).toBe(diceSize);
    });

    it('should return 1 if fighter has AF2 item and random is less than or equal to 0.5', () => {
        const diceSize = 6;
        const fighter = { player: { id: 'player1' } } as any;

        jest.spyOn(service['inventoryService'], 'hasAF2Item').mockReturnValue(true);
        jest.spyOn(Math, 'random').mockReturnValue(0.5);

        const result = service['throwDice'](diceSize, fighter);
        expect(result).toBe(1);
    });

    it('should return a number between 1 and diceSize if fighter does not have AF2 item', () => {
        const diceSize = 6;
        const fighter = { player: { id: 'player1' } } as any;

        jest.spyOn(service['inventoryService'], 'hasAF2Item').mockReturnValue(false);
        jest.spyOn(Math, 'random').mockReturnValue(0.4);

        const result = service['throwDice'](diceSize, fighter);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(diceSize);
    });

    it('should emit disperseItems event with correct parameters', () => {
        const server = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
        } as any;
        const roomId = 'room1';
        const itemsPositions = [
            { idx: 1, item: 'item1' },
            { idx: 2, item: 'item2' },
        ];

        service['emitDisperseItemsKilledPlayer'](server, roomId, itemsPositions);

        expect(server.to).toHaveBeenCalledWith(roomId);
        expect(server.emit).toHaveBeenCalledWith('disperseItems', itemsPositions);
    });
});
