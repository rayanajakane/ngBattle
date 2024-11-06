import { GameJson } from '@app/model/game-structure';
import { CombatService } from '@app/services/combat/combat.service';
import { GameService } from '@app/services/game.service';
import { Player } from '@app/services/match.service';
import { MovementService } from '@app/services/movement/movement.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'socket.io';
import { ActionService, GameInstance, PlayerInfo, TileType } from './action.service';

describe('ActionService', () => {
    let service: ActionService;
    let combatService: CombatService;
    let gameService: GameService;
    let movementService: MovementService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ActionService,
                {
                    provide: CombatService,
                    useValue: {
                        isValidCombatPosition: jest.fn(),
                        fight: jest.fn(),
                    },
                },
                {
                    provide: GameService,
                    useValue: {
                        get: jest.fn(),
                    },
                },
                {
                    provide: MovementService,
                    useValue: {
                        shortestPath: jest.fn(),
                        availableMoves: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<ActionService>(ActionService);
        combatService = module.get<CombatService>(CombatService);
        gameService = module.get<GameService>(GameService);
        movementService = module.get<MovementService>(MovementService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('startFight', () => {
        let server: Server;
        let roomId: string;
        let playerId: string;
        let targetId: string;
        let gameInstance: GameInstance;
        let attacker: Player;
        let defender: Player;

        beforeEach(() => {
            server = new Server();
            roomId = 'room1';
            playerId = 'player1';
            targetId = 'player2';

            attacker = {
                id: playerId,
                name: 'Attacker',
                isAdmin: false,
                avatar: 'avatar1',
                isActive: true,
                abandoned: false,
                attributes: { speed: '10', health: '100', attack: '50', defense: '30' },
                wins: 0,
            } as Player;
            defender = {
                id: targetId,
                name: 'Defender',
                isAdmin: false,
                avatar: 'avatar2',
                isActive: true,
                abandoned: false,
                attributes: { speed: '5', health: '100', attack: '50', defense: '30' },
            } as Player;

            gameInstance = {
                roomId,
                game: { id: 'game1', gameName: 'Test Game', gameDescription: 'A test game', gameType: 'type1', map: [], mapSize: '10' } as GameJson,
                playersCoord: [
                    { player: attacker, position: 1 },
                    { player: defender, position: 2 },
                ],
                fightParticipants: [],
                fightTurns: 0,
            };

            service.activeGames = [gameInstance];
        });

        it('should set fightParticipants and fightTurns', () => {
            service.startFight(server, roomId, playerId, targetId);

            expect(gameInstance.fightParticipants).toEqual([attacker, defender]);
            expect(gameInstance.fightTurns).toBe(0);
        });

        it('should call combat.fight if positions are valid', () => {
            jest.spyOn(combatService, 'isValidCombatPosition').mockReturnValue(true);

            service.startFight(server, roomId, playerId, targetId);

            expect(combatService.isValidCombatPosition).toHaveBeenCalledWith(gameInstance.game, 1, 2);
            expect(combatService.fight).toHaveBeenCalledWith(server, roomId, attacker, defender);
        });

        it('should not call combat.fight if positions are invalid', () => {
            jest.spyOn(combatService, 'isValidCombatPosition').mockReturnValue(false);

            service.startFight(server, roomId, playerId, targetId);

            expect(combatService.isValidCombatPosition).toHaveBeenCalledWith(gameInstance.game, 1, 2);
            expect(combatService.fight).not.toHaveBeenCalled();
        });

        it('should set fightParticipants in correct order based on speed', () => {
            attacker.attributes.speed = '5';
            defender.attributes.speed = '10';

            service.startFight(server, roomId, playerId, targetId);

            expect(gameInstance.fightParticipants).toEqual([defender, attacker]);
        });
    });

    describe('availablePlayerMoves', () => {
        it('should return available moves for a player', () => {
            const roomId = 'room1';
            const playerId = 'player1';
            const gameInstance: GameInstance = {
                roomId,
                game: { id: 'game1', gameName: 'Test Game', gameDescription: 'A test game', gameType: 'type1', map: [], mapSize: '10' } as GameJson,
                playersCoord: [{ player: { id: playerId }, position: 1 } as PlayerInfo],
                currentPlayerMoveBudget: 5,
            };
            service.activeGames = [gameInstance];

            jest.spyOn(movementService, 'availableMoves').mockReturnValue({ 1: [2, 3] });

            const result = service.availablePlayerMoves(playerId, roomId);

            expect(result).toEqual({ 1: [2, 3] });
            expect(movementService.availableMoves).toHaveBeenCalledWith(5, gameInstance.game, 1);
        });
    });

    describe('interactWithDoor', () => {
        it('should interact with a door and change its state', () => {
            const roomId = 'room1';
            const playerId = 'player1';
            const doorPosition = 2;
            const gameInstance: GameInstance = {
                roomId,
                game: {
                    id: 'game1',
                    gameName: 'Test Game',
                    gameDescription: 'A test game',
                    gameType: 'type1',
                    map: [{}, { tileType: TileType.DoorOpen }, {}],
                    mapSize: '3',
                } as GameJson,
                playersCoord: [{ player: { id: playerId }, position: 1 } as PlayerInfo],
                currentPlayerActionPoint: 1,
            };
            service.activeGames = [gameInstance];

            const result = service.interactWithDoor(roomId, playerId, doorPosition);

            expect(result).toBe(true);
            expect(gameInstance.game.map[doorPosition].tileType).toBe(TileType.DoorOpen);
            expect(gameInstance.currentPlayerActionPoint).toBe(0);
        });

        it('should not interact with a door if not adjacent', () => {
            const roomId = 'room1';
            const playerId = 'player1';
            const doorPosition = 5;
            const gameInstance: GameInstance = {
                roomId,
                game: {
                    id: 'game1',
                    gameName: 'Test Game',
                    gameDescription: 'A test game',
                    gameType: 'type1',
                    map: [{}, {}, {}, {}, {}, { tileType: TileType.DoorOpen }],
                    mapSize: '3',
                } as GameJson,
                playersCoord: [{ player: { id: playerId }, position: 1 } as PlayerInfo],
                currentPlayerActionPoint: 1,
            };
            service.activeGames = [gameInstance];

            const result = service.interactWithDoor(roomId, playerId, doorPosition);

            expect(result).toBe(false);
            expect(gameInstance.game.map[doorPosition].tileType).toBe(TileType.DoorOpen);
            expect(gameInstance.currentPlayerActionPoint).toBe(1);
        });
    });

    describe('quitGame', () => {
        it('should remove a player from the game', () => {
            const roomId = 'room1';
            const playerId = 'player1';
            const gameInstance: GameInstance = {
                roomId,
                game: { id: 'game1', gameName: 'Test Game', gameDescription: 'A test game', gameType: 'type1', map: [], mapSize: '10' } as GameJson,
                playersCoord: [{ player: { id: playerId }, position: 1 } as PlayerInfo, { player: { id: 'player2' }, position: 2 } as PlayerInfo],
            };
            service.activeGames = [gameInstance];

            service.quitGame(roomId, playerId);

            expect(gameInstance.playersCoord).toEqual([{ player: { id: 'player2' }, position: 2 }]);
        });
    });
});
