import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { GameService } from '@app/services/game.service';
import { MovementService } from '@app/services/movement/movement.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ActionService } from './action.service';

/* eslint-disable */

describe('ActionService', () => {
    let service: ActionService;
    let gameService: GameService;
    let movementService: MovementService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ActionService,
                ActiveGamesService,
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
        gameService = module.get<GameService>(GameService);
        movementService = module.get<MovementService>(MovementService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // describe('availablePlayerMoves', () => {
    //     it('should return available moves for a player', () => {
    //         const roomId = 'room1';
    //         const playerId = 'player1';
    //         const gameInstance: GameInstance = {
    //             roomId,
    //             game: {
    //                 id: 'game1',
    //                 gameName: 'Test Game',
    //                 gameDescription: 'A test game',
    //                 gameType: 'type1',
    //                 map: [],
    //                 mapSize: '10',
    //             } as GameStructure,
    //             playersCoord: [{ player: { id: playerId }, position: 1 } as PlayerInfo],
    //             currentPlayerMoveBudget: 5,
    //         };
    //         service.activeGames = [gameInstance];

    //         jest.spyOn(movementService, 'availableMoves').mockReturnValue({ 1: [2, 3] });

    //         const result = service.availablePlayerMoves(playerId, roomId);

    //         expect(result).toEqual({ 1: [2, 3] });
    //         expect(movementService.availableMoves).toHaveBeenCalledWith(5, gameInstance.game, 1);
    //     });
    // });

    // describe('interactWithDoor', () => {
    //     it('should interact with a door and change its state', () => {
    //         const roomId = 'room1';
    //         const playerId = 'player1';
    //         const doorPosition = 2;
    //         const gameInstance: GameInstance = {
    //             roomId,
    //             game: {
    //                 id: 'game1',
    //                 gameName: 'Test Game',
    //                 gameDescription: 'A test game',
    //                 gameType: 'type1',
    //                 map: [{}, { tileType: TileType.DoorOpen }, {}],
    //                 mapSize: '3',
    //             } as GameStructure,
    //             playersCoord: [{ player: { id: playerId }, position: 1 } as PlayerInfo],
    //             currentPlayerActionPoint: 1,
    //         };
    //         service.activeGames = [gameInstance];

    //         const result = service.interactWithDoor(roomId, playerId, doorPosition);

    //         expect(result).toBe(true);
    //         expect(gameInstance.game.map[doorPosition].tileType).toBe('doorOpen');
    //         expect(gameInstance.currentPlayerActionPoint).toBe(0);
    //     });

    //     it('should not interact with a door if not adjacent', () => {
    //         const roomId = 'room1';
    //         const playerId = 'player1';
    //         const doorPosition = 5;
    //         const gameInstance: GameInstance = {
    //             roomId,
    //             game: {
    //                 id: 'game1',
    //                 gameName: 'Test Game',
    //                 gameDescription: 'A test game',
    //                 gameType: 'type1',
    //                 map: [{}, {}, {}, {}, {}, { tileType: TileType.DoorOpen }],
    //                 mapSize: '3',
    //             } as GameStructure,
    //             playersCoord: [{ player: { id: playerId }, position: 1 } as PlayerInfo],
    //             currentPlayerActionPoint: 1,
    //         };
    //         service.activeGames = [gameInstance];

    //         const result = service.interactWithDoor(roomId, playerId, doorPosition);

    //         expect(result).toBe(false);
    //         expect(gameInstance.game.map[doorPosition].tileType).toBe(TileType.DoorOpen);
    //         expect(gameInstance.currentPlayerActionPoint).toBe(1);
    //     });
    // });

    // describe('quitGame', () => {
    //     it('should remove a player from the game', () => {
    //         const roomId = 'room1';
    //         const playerId = 'player1';
    //         const gameInstance: GameInstance = {
    //             roomId,
    //             game: {
    //                 id: 'game1',
    //                 gameName: 'Test Game',
    //                 gameDescription: 'A test game',
    //                 gameType: 'type1',
    //                 map: [],
    //                 mapSize: '10',
    //             } as GameStructure,
    //             playersCoord: [{ player: { id: playerId }, position: 1 } as PlayerInfo, { player: { id: 'player2' }, position: 2 } as PlayerInfo],
    //         };
    //         service.activeGames = [gameInstance];

    //         service.quitGame(roomId, playerId);

    //         expect(gameInstance.playersCoord).toEqual([{ player: { id: 'player2' }, position: 2 }]);
    //     });
    // });

    // describe('nextTurn', () => {
    //     let gameInstance: GameInstance;
    //     const roomId = 'room1';

    //     beforeEach(() => {
    //         gameInstance = {
    //             roomId,
    //             game: { id: 'game1' } as GameStructure,
    //             playersCoord: [
    //                 { player: { id: 'player1' } as Player, position: 1 },
    //                 { player: { id: 'player2' } as Player, position: 2 },
    //                 { player: { id: 'player3' } as Player, position: 3 },
    //             ],
    //             turn: 0,
    //         };
    //         service.activeGames = [gameInstance];
    //     });

    //     it('should increment turn when lastTurn is false', () => {
    //         service.nextTurn(roomId, false);
    //         expect(gameInstance.turn).toBe(1);
    //     });

    //     it('should wrap turn back to 0 when reaching end of players', () => {
    //         gameInstance.turn = 2;
    //         service.nextTurn(roomId, false);
    //         expect(gameInstance.turn).toBe(0);
    //     });

    //     it('should handle lastTurn=true by removing current player and setting correct next turn', () => {
    //         gameInstance.turn = 0;
    //         service.nextTurn(roomId, true);

    //         // Verify player1 was removed
    //         expect(gameInstance.playersCoord.length).toBe(2);
    //         expect(gameInstance.playersCoord.find((p) => p.player.id === 'player1')).toBeUndefined();

    //         // Verify turn is set to player2's new index
    //         expect(gameInstance.turn).toBe(0);
    //         expect(gameInstance.playersCoord[gameInstance.turn].player.id).toBe('player2');
    //     });
    // });
    // describe('findStartingPositions', () => {
    //     let gameJson: GameStructure;

    //     beforeEach(() => {
    //         gameJson = {
    //             id: 'test-game',
    //             gameName: 'Test Game',
    //             gameDescription: 'Test Description',
    //             gameType: 'test',
    //             mapSize: '3',
    //             map: [],
    //         } as GameStructure;
    //     });

    //     it('should return empty array for empty map', () => {
    //         gameJson.map = [];
    //         const result = service.findStartingPositions(gameJson);
    //         expect(result).toEqual([]);
    //     });

    //     it('should return empty array when no starting points exist', () => {
    //         gameJson.map = [
    //             { item: 'wall', tileType: 'wall', hasPlayer: false, idx: 0 },
    //             { item: 'floor', tileType: 'floor', hasPlayer: false, idx: 1 },
    //             { item: 'door', tileType: 'door', hasPlayer: false, idx: 2 },
    //         ];
    //         const result = service.findStartingPositions(gameJson);
    //         expect(result).toEqual([]);
    //     });

    //     it('should return index of single starting point', () => {
    //         gameJson.map = [
    //             { item: 'wall', tileType: 'wall', hasPlayer: false, idx: 0 },
    //             { item: 'startingPoint', tileType: 'floor', hasPlayer: false, idx: 1 },
    //             { item: 'floor', tileType: 'floor', hasPlayer: false, idx: 2 },
    //         ];
    //         const result = service.findStartingPositions(gameJson);
    //         expect(result).toEqual([1]);
    //     });

    //     it('should return all indices of multiple starting points', () => {
    //         gameJson.map = [
    //             { item: 'startingPoint', tileType: 'floor', hasPlayer: false, idx: 0 },
    //             { item: 'floor', tileType: 'floor', hasPlayer: false, idx: 1 },
    //             { item: 'startingPoint', tileType: 'floor', hasPlayer: false, idx: 2 },
    //             { item: 'startingPoint', tileType: 'floor', hasPlayer: false, idx: 3 },
    //         ];
    //         const result = service.findStartingPositions(gameJson);
    //         expect(result).toEqual([0, 2, 3]);
    //     });

    //     it('should return correct indices in mixed tile map', () => {
    //         gameJson.map = [
    //             { item: 'wall', tileType: 'wall', hasPlayer: false, idx: 0 },
    //             { item: 'startingPoint', tileType: 'floor', hasPlayer: false, idx: 1 },
    //             { item: 'floor', tileType: 'floor', hasPlayer: false, idx: 2 },
    //             { item: 'door', tileType: 'door', hasPlayer: false, idx: 3 },
    //             { item: 'startingPoint', tileType: 'floor', hasPlayer: false, idx: 4 },
    //             { item: 'wall', tileType: 'wall', hasPlayer: false, idx: 5 },
    //         ];
    //         const result = service.findStartingPositions(gameJson);
    //         expect(result).toEqual([1, 4]);
    //     });
    // });
    // describe('randomizePlayerPosition', () => {
    //     let gameJson: GameStructure;
    //     let players: Player[];

    //     beforeEach(() => {
    //         gameJson = {
    //             id: 'test-game',
    //             gameName: 'Test Game',
    //             gameDescription: 'Test Description',
    //             gameType: 'test',
    //             mapSize: '3',
    //             map: [
    //                 { item: 'startingPoint', hasPlayer: false },
    //                 { item: 'startingPoint', hasPlayer: false },
    //                 { item: 'startingPoint', hasPlayer: false },
    //                 { item: 'wall', hasPlayer: false },
    //             ],
    //         } as GameStructure;

    //         players = [{ id: 'p1', attributes: {}, wins: 5 } as Player, { id: 'p2', attributes: {}, wins: 3 } as Player];
    //     });

    //     it('should assign valid positions to all players', () => {
    //         const result = service.randomizePlayerPosition(gameJson, players);

    //         expect(result.length).toBe(2);
    //         expect(result[0].position).toBeLessThan(3);
    //         expect(result[1].position).toBeLessThan(3);
    //     });

    //     it('should assign unique positions to each player', () => {
    //         const result = service.randomizePlayerPosition(gameJson, players);

    //         expect(result[0].position).not.toBe(result[1].position);
    //     });

    //     it('should mark tiles as having players', () => {
    //         const result = service.randomizePlayerPosition(gameJson, players);

    //         result.forEach((playerInfo) => {
    //             expect(gameJson.map[playerInfo.position].hasPlayer).toBe(true);
    //         });
    //     });

    //     it('should reset player wins to 0', () => {
    //         const result = service.randomizePlayerPosition(gameJson, players);

    //         result.forEach((playerInfo) => {
    //             expect(playerInfo.player.wins).toBe(0);
    //         });
    //     });

    //     it('should clear unused starting points', () => {
    //         const result = service.randomizePlayerPosition(gameJson, players);

    //         const remainingStartPoints = gameJson.map
    //             .filter((tile, index) => !result.some((p) => p.position === index))
    //             .filter((tile) => tile.item === 'startingPoint');

    //         expect(remainingStartPoints.length).toBe(0);
    //     });

    //     it('should handle exact number of players and starting positions', () => {
    //         gameJson.map = [
    //             { item: 'startingPoint', hasPlayer: false, idx: 0, tileType: 'floor' },
    //             { item: 'startingPoint', hasPlayer: false, idx: 1, tileType: 'floor' },
    //         ];

    //         const result = service.randomizePlayerPosition(gameJson, players);

    //         expect(result.length).toBe(2);
    //         expect(result[0].position).toBeLessThan(2);
    //         expect(result[1].position).toBeLessThan(2);
    //     });

    //     it('should distribute positions randomly', () => {
    //         // Run multiple times to check randomization
    //         const positions = new Set<number>();
    //         for (let i = 0; i < 10; i++) {
    //             const result = service.randomizePlayerPosition(JSON.parse(JSON.stringify(gameJson)), JSON.parse(JSON.stringify(players)));
    //             positions.add(result[0].position);
    //         }

    //         // Should see different positions used across runs
    //         expect(positions.size).toBeGreaterThan(1);
    //     });
    // });
    // describe('gameSetup', () => {
    //     let server: Server;
    //     let roomId: string;
    //     let gameId: string;
    //     let players: Player[];
    //     let gameJson: GameStructure;

    //     beforeEach(() => {
    //         server = {
    //             to: jest.fn().mockReturnValue({ emit: jest.fn() }),
    //         } as unknown as Server;

    //         roomId = 'testRoom';
    //         gameId = 'testGame';
    //         players = [
    //             {
    //                 id: 'p1',
    //                 attributes: { speed: '10' },
    //                 wins: 0,
    //             } as Player,
    //             {
    //                 id: 'p2',
    //                 attributes: { speed: '20' },
    //                 wins: 0,
    //             } as Player,
    //             {
    //                 id: 'p3',
    //                 attributes: { speed: '15' },
    //                 wins: 0,
    //             } as Player,
    //         ];

    //         gameJson = {
    //             id: gameId,
    //             map: [
    //                 { item: 'startingPoint', hasPlayer: false, idx: 0, tileType: 'floor' },
    //                 { item: 'startingPoint', hasPlayer: false, idx: 1, tileType: 'floor' },
    //                 { item: 'startingPoint', hasPlayer: false, idx: 2, tileType: 'floor' },
    //             ],
    //         } as GameStructure;

    //         jest.spyOn(gameService, 'get').mockResolvedValue(gameJson as Game);
    //     });

    //     it('should create new game instance if none exists', async () => {
    //         service.activeGames = [];

    //         service.gameSetup(server, roomId, gameId, players);
    //         await new Promise(process.nextTick);

    //         expect(service.activeGames.length).toBe(1);
    //         expect(service.activeGames[0].roomId).toBe(roomId);
    //         expect(service.activeGames[0].game).toEqual(gameJson);
    //     });

    //     it('should sort players by speed in descending order', async () => {
    //         service.activeGames = [{ roomId, game: gameJson }];

    //         service.gameSetup(server, roomId, gameId, players);
    //         await new Promise(process.nextTick);

    //         const sortedPlayers = service.activeGames[0].playersCoord;
    //         expect(sortedPlayers[0].player.attributes.speed).toBe('20');
    //         expect(sortedPlayers[1].player.attributes.speed).toBe('15');
    //         expect(sortedPlayers[2].player.attributes.speed).toBe('10');
    //     });

    //     it('should initialize game with turn set to 0', async () => {
    //         service.activeGames = [{ roomId, game: gameJson }];

    //         service.gameSetup(server, roomId, gameId, players);
    //         await new Promise(process.nextTick);

    //         expect(service.activeGames[0].turn).toBe(0);
    //     });

    //     it('should emit gameSetup event with correct data', async () => {
    //         service.activeGames = [{ roomId, game: gameJson }];
    //         const emitSpy = jest.spyOn(server.to(roomId), 'emit');

    //         service.gameSetup(server, roomId, gameId, players);
    //         await new Promise(process.nextTick);

    //         expect(emitSpy).toHaveBeenCalledWith('gameSetup', {
    //             playerCoords: expect.any(Array),
    //             turn: 0,
    //         });
    //     });

    //     it('should integrate with randomizePlayerPosition', async () => {
    //         service.activeGames = [{ roomId, game: gameJson }];
    //         const randomizeSpy = jest.spyOn(service, 'randomizePlayerPosition');

    //         service.gameSetup(server, roomId, gameId, players);
    //         await new Promise(process.nextTick);

    //         expect(randomizeSpy).toHaveBeenCalledWith(gameJson, players);
    //         expect(service.activeGames[0].playersCoord.length).toBe(players.length);
    //     });

    //     it('should handle multiple game instances independently', async () => {
    //         const room2 = 'room2';
    //         service.activeGames = [
    //             { roomId, game: gameJson },
    //             { roomId: room2, game: { ...gameJson, id: 'game2' } },
    //         ];

    //         service.gameSetup(server, roomId, gameId, players);
    //         await new Promise(process.nextTick);

    //         expect(service.activeGames).toHaveLength(2);
    //         expect(service.activeGames[0].playersCoord).toBeDefined();
    //         expect(service.activeGames[1].playersCoord).toBeUndefined();
    //     });
    // });
    // describe('movePlayer', () => {
    //     let gameInstance: GameInstance;
    //     const roomId = 'testRoom';

    //     beforeEach(() => {
    //         gameInstance = {
    //             roomId,
    //             game: {
    //                 id: 'game1',
    //                 map: [
    //                     { tileType: TileType.Floor, hasPlayer: false, idx: 0, item: '' },
    //                     { tileType: TileType.Floor },
    //                     { tileType: TileType.Floor },
    //                 ],
    //                 gameName: 'Test Game',
    //                 gameDescription: 'A test game',
    //                 gameType: 'type1',
    //                 mapSize: '10',
    //                 isVisible: true,
    //                 creationDate: '2021-01-01',
    //                 lastModified: '2021-01-01',
    //             } as unknown as GameStructure,
    //             currentPlayerMoveBudget: 5,
    //         };
    //         service.activeGames = [gameInstance];
    //     });

    //     it('should return path from movement service', () => {
    //         const expectedPath = [0, 1, 2];
    //         jest.spyOn(movementService, 'shortestPath').mockReturnValue({
    //             path: expectedPath,
    //             moveCost: 2,
    //         });

    //         const result = service.movePlayer(roomId, 0, 2);

    //         expect(result).toEqual(expectedPath);
    //         expect(movementService.shortestPath).toHaveBeenCalledWith(5, gameInstance.game, 0, 2);
    //     });

    //     it('should deduct move cost from player budget', () => {
    //         const moveCost = 3;
    //         jest.spyOn(movementService, 'shortestPath').mockReturnValue({
    //             path: [0, 1, 2],
    //             moveCost,
    //         });

    //         service.movePlayer(roomId, 0, 2);

    //         expect(gameInstance.currentPlayerMoveBudget).toBe(2);
    //     });

    //     it('should handle zero movement cost', () => {
    //         jest.spyOn(movementService, 'shortestPath').mockReturnValue({
    //             path: [1],
    //             moveCost: 0,
    //         });

    //         service.movePlayer(roomId, 1, 1);

    //         expect(gameInstance.currentPlayerMoveBudget).toBe(5);
    //     });

    //     it('should use correct game instance for multiple active games', () => {
    //         const room2 = 'room2';
    //         const game2Instance = {
    //             roomId: room2,
    //             game: { id: 'game2', map: [] } as GameStructure,
    //             currentPlayerMoveBudget: 3,
    //         };
    //         service.activeGames.push(game2Instance);

    //         jest.spyOn(movementService, 'shortestPath').mockReturnValue({
    //             path: [0, 1],
    //             moveCost: 1,
    //         });

    //         service.movePlayer(room2, 0, 1);

    //         expect(game2Instance.currentPlayerMoveBudget).toBe(2);
    //         expect(gameInstance.currentPlayerMoveBudget).toBe(5);
    //     });

    //     it('should pass correct parameters to shortestPath', () => {
    //         const shortestPathSpy = jest.spyOn(movementService, 'shortestPath').mockReturnValue({ path: [0], moveCost: 0 });

    //         service.movePlayer(roomId, 0, 2);

    //         expect(shortestPathSpy).toHaveBeenCalledWith(gameInstance.currentPlayerMoveBudget, gameInstance.game, 0, 2);
    //     });
    // });
    // describe('interactWithDoor', () => {
    //     let gameInstance: GameInstance;
    //     const roomId = 'testRoom';
    //     const playerId = 'player1';

    //     beforeEach(() => {
    //         gameInstance = {
    //             roomId,
    //             game: {
    //                 id: 'game1',
    //                 mapSize: '3',
    //                 map: Array(9).fill({ tileType: 'doorOpen' }),
    //                 gameName: 'Test Game',
    //                 gameDescription: 'Test',
    //                 gameType: 'test',
    //             } as GameStructure,
    //             playersCoord: [{ player: { id: playerId } as Player, position: 4 }],
    //             currentPlayerActionPoint: 2,
    //         };
    //         service.activeGames = [gameInstance];
    //     });

    //     it('should allow interaction with door from position right', () => {
    //         const doorPosition = 3;
    //         gameInstance.playersCoord[0].position = doorPosition + 1;

    //         const result = service.interactWithDoor(roomId, playerId, doorPosition);

    //         expect(result).toBe(true);
    //         expect(gameInstance.game.map[doorPosition].tileType).toBe('doorClosed');
    //     });

    //     it('should allow interaction with door from position left', () => {
    //         const doorPosition = 5;
    //         gameInstance.playersCoord[0].position = doorPosition - 1;

    //         const result = service.interactWithDoor(roomId, playerId, doorPosition);

    //         expect(result).toBe(true);
    //     });

    //     it('should allow interaction with door from position above', () => {
    //         const doorPosition = 4;
    //         gameInstance.playersCoord[0].position = doorPosition - 3;

    //         const result = service.interactWithDoor(roomId, playerId, doorPosition);

    //         expect(result).toBe(true);
    //     });

    //     it('should allow interaction with door from position below', () => {
    //         const doorPosition = 4;
    //         gameInstance.playersCoord[0].position = doorPosition + 3;

    //         const result = service.interactWithDoor(roomId, playerId, doorPosition);

    //         expect(result).toBe(true);
    //     });

    //     it('should not allow interaction with non-adjacent door', () => {
    //         const doorPosition = 8;
    //         gameInstance.playersCoord[0].position = 0;

    //         const result = service.interactWithDoor(roomId, playerId, doorPosition);

    //         expect(result).toBe(false);
    //         expect(gameInstance.game.map[doorPosition].tileType).toBe('doorOpen');
    //         expect(gameInstance.currentPlayerActionPoint).toBe(2);
    //     });

    //     it('should toggle door state from open to closed', () => {
    //         const doorPosition = 4;
    //         gameInstance.playersCoord[0].position = 5;
    //         gameInstance.game.map[doorPosition].tileType = 'doorOpen';

    //         service.interactWithDoor(roomId, playerId, doorPosition);

    //         expect(gameInstance.game.map[doorPosition].tileType).toBe('doorClosed');
    //     });

    //     it('should toggle door state from closed to open', () => {
    //         const doorPosition = 4;
    //         gameInstance.playersCoord[0].position = 5;
    //         gameInstance.game.map[doorPosition].tileType = 'doorClosed';

    //         service.interactWithDoor(roomId, playerId, doorPosition);

    //         expect(gameInstance.game.map[doorPosition].tileType).toBe('doorOpen');
    //     });

    //     it('should deduct one action point on successful interaction', () => {
    //         const doorPosition = 4;
    //         gameInstance.playersCoord[0].position = 5;

    //         service.interactWithDoor(roomId, playerId, doorPosition);

    //         expect(gameInstance.currentPlayerActionPoint).toBe(1);
    //     });

    //     it('should work with different map sizes', () => {
    //         gameInstance.game.mapSize = '4';
    //         const doorPosition = 5;
    //         gameInstance.playersCoord[0].position = doorPosition + 4; // Below in 4x4 grid

    //         const result = service.interactWithDoor(roomId, playerId, doorPosition);

    //         expect(result).toBe(true);
    //         expect(gameInstance.currentPlayerActionPoint).toBe(1);
    //     });

    //     // it('should handle multiple game instances correctly', () => {
    //     //     const room2 = 'room2';
    //     //     const game2Instance = { ...gameInstance, roomId: room2 };
    //     //     service.activeGames.push(game2Instance);

    //     //     const doorPosition = 4;
    //     //     gameInstance.playersCoord[0].position = 5;

    //     //     service.interactWithDoor(roomId, playerId, doorPosition);

    //     //     expect(gameInstance.game.map[doorPosition].tileType).toBe('doorClosed');
    //     //     expect(game2Instance.game.map[doorPosition].tileType).toBe('doorOpen');
    //     // });
    // });
});
