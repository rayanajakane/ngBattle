import { GameJson } from '@app/model/game-structure';
import { Test, TestingModule } from '@nestjs/testing';
import { Coord } from '../action/action.service';
import { MovementService } from './movement.service';

describe('MovementService', () => {
    let service: MovementService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MovementService],
        }).compile();

        service = module.get<MovementService>(MovementService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('isValidPosition', () => {
        it('should return false if coordinates are out of bounds', () => {
            const game: GameJson = { mapSize: '5', map: [] } as GameJson;
            const coord: Coord = { x: 6, y: 6, distance: 0 };
            expect(service.isValidPosition(10, game, coord)).toBe(false);
        });

        it('should return false if tile type is invalid', () => {
            const game: GameJson = { mapSize: '5', map: [{ tileType: 'wall', hasPlayer: false }] } as GameJson;
            const coord: Coord = { x: 0, y: 0, distance: 0 };
            expect(service.isValidPosition(10, game, coord)).toBe(false);
        });

        it('should return false if tile has a player', () => {
            const game: GameJson = { mapSize: '5', map: [{ tileType: 'floor', hasPlayer: true }] } as GameJson;
            const coord: Coord = { x: 0, y: 0, distance: 0 };
            expect(service.isValidPosition(10, game, coord)).toBe(false);
        });

        it('should return false if move budget is insufficient', () => {
            const game: GameJson = { mapSize: '5', map: [{ tileType: 'floor', hasPlayer: false }] } as GameJson;
            const coord: Coord = { x: 0, y: 0, distance: 10 };
            expect(service.isValidPosition(5, game, coord)).toBe(false);
        });

        it('should return true for valid position', () => {
            const game: GameJson = { mapSize: '5', map: [{ tileType: 'floor', hasPlayer: false }] } as GameJson;
            const coord: Coord = { x: 0, y: 0, distance: 0 };
            expect(service.isValidPosition(10, game, coord)).toBe(true);
        });
    });

    describe('tileValue', () => {
        it('should return correct values for tile types', () => {
            expect(service.tileValue('ice')).toBe(0);
            expect(service.tileValue('floor')).toBe(1);
            expect(service.tileValue('doorOpen')).toBe(1);
            expect(service.tileValue('water')).toBe(2);
            expect(service.tileValue('unknown')).toBe(1);
        });
    });

    describe('convertToCoord', () => {
        it('should convert position to coordinates correctly', () => {
            expect(service.convertToCoord(12, 5)).toEqual({ x: 2, y: 2 });
        });
    });

    describe('convertToPosition', () => {
        it('should convert coordinates to position correctly', () => {
            expect(service.convertToPosition({ x: 2, y: 2 }, 5)).toBe(12);
        });
    });

    describe('shortestPath', () => {
        it('should find the shortest path correctly', () => {
            const game: GameJson = {
                mapSize: '5',
                map: Array(25).fill({ tileType: 'floor', hasPlayer: false }),
            } as GameJson;
            const result = service.shortestPath(10, game, 0, 24);
            expect(result.path).toEqual([0, 1, 2, 3, 4, 9, 14, 19, 24]);
        });
    });

    describe('availableMoves', () => {
        it('should find all available moves correctly', () => {
            const game: GameJson = {
                mapSize: '5',
                map: Array(25).fill({ tileType: 'floor', hasPlayer: false }),
            } as GameJson;
            const result = service.availableMoves(10, game, 0);
            expect(Object.keys(result).length).toBeGreaterThan(0);
        });
    });
    describe('shortestPath', () => {
        it('should find the shortest path correctly', () => {
            const game: GameJson = {
                mapSize: '5',
                map: Array(25).fill({ tileType: 'floor', hasPlayer: false }),
            } as GameJson;
            const result = service.shortestPath(10, game, 0, 24);
            expect(result.path).toEqual([0, 1, 2, 3, 4, 9, 14, 19, 24]);
        });

        it('should return an empty path if no valid path is found', () => {
            const game: GameJson = {
                mapSize: '5',
                map: Array(25).fill({ tileType: 'wall', hasPlayer: false }),
            } as GameJson;
            const result = service.shortestPath(10, game, 0, 24);
            expect(result.path).toEqual([]);
        });

        it('should return the correct move cost', () => {
            const game: GameJson = {
                mapSize: '5',
                map: Array(25).fill({ tileType: 'floor', hasPlayer: false }),
            } as GameJson;
            const result = service.shortestPath(10, game, 0, 24);
            expect(result.moveCost).toBe(8);
        });
    });

    describe('availableMoves', () => {
        it('should find all available moves correctly', () => {
            const game: GameJson = {
                mapSize: '5',
                map: Array(25).fill({ tileType: 'floor', hasPlayer: false }),
            } as GameJson;
            const result = service.availableMoves(10, game, 0);
            expect(Object.keys(result).length).toBeGreaterThan(0);
        });

        it('should return an empty object if no moves are available', () => {
            const game: GameJson = {
                mapSize: '5',
                map: Array(25).fill({ tileType: 'wall', hasPlayer: false }),
            } as GameJson;
            const result = service.availableMoves(10, game, 0);
            expect(result).toEqual({});
        });

        it('should return the correct paths for available moves', () => {
            const game: GameJson = {
                mapSize: '5',
                map: Array(25).fill({ tileType: 'floor', hasPlayer: false }),
            } as GameJson;
            const result = service.availableMoves(10, game, 0);
            const expectedPath = [0, 1, 2, 3, 4, 9, 14, 19, 24];
            expect(result[24]).toEqual(expectedPath);
        });
    });
});
