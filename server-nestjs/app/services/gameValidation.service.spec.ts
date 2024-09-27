import { Game } from '@app/model/schema/game.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model, Query } from 'mongoose';
import { GameValidationService } from './gameValidation.service';
import { MapValidationService } from './mapValidation.service';

/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

describe('GameValidationService', () => {
    let service: GameValidationService;
    let mapValidationService: MapValidationService;
    let model: Model<Game>;

    const validGame = {
        id: '123',
        gameName: 'Game',
        gameDescription: 'This is a game description',
        mapSize: '3',
        map: [
            { idx: 0, tileType: '', item: 'startingPoint', hasPlayer: false },
            { idx: 1, tileType: '', item: '', hasPlayer: false },
            { idx: 2, tileType: '', item: '', hasPlayer: false },
            { idx: 3, tileType: '', item: '', hasPlayer: false },
            { idx: 4, tileType: '', item: '', hasPlayer: false },
            { idx: 5, tileType: '', item: '', hasPlayer: false },
            { idx: 6, tileType: '', item: '', hasPlayer: false },
            { idx: 7, tileType: '', item: '', hasPlayer: false },
            { idx: 8, tileType: '', item: 'startingPoint', hasPlayer: false },
        ],
        gameType: 'ctf',
        isVisible: false,
        creationDate: '2024-09-18T10:30:00.000Z',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameValidationService,
                {
                    provide: MapValidationService,
                    useValue: {
                        hasStartingPoints: jest.fn(),
                        hasCorrectGroundAmount: jest.fn(),
                        areAllTilesAccessible: jest.fn(),
                        areAllDoorsValid: jest.fn(),
                    },
                },
                {
                    provide: getModelToken('Game'),
                    useValue: {
                        find: jest.fn(),
                        exec: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<GameValidationService>(GameValidationService);
        mapValidationService = module.get<MapValidationService>(MapValidationService);
        model = module.get<Model<Game>>(getModelToken('Game'));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call all validation methods', () => {
        jest.spyOn(service, 'validateProperties').mockImplementationOnce(() => {});
        jest.spyOn(service, 'validateMap').mockImplementationOnce(() => {});
        jest.spyOn(service, 'validateGameName').mockImplementationOnce(() => {});
        jest.spyOn(service, 'validateUniqueChecks').mockResolvedValueOnce(undefined);
        service.validateGame(validGame);
        expect(service.validateProperties).toHaveBeenCalled();
        expect(service.validateMap).toHaveBeenCalled();
        expect(service.validateGameName).toHaveBeenCalled();
        expect(service.validateUniqueChecks).toHaveBeenCalled();
    });

    it('should return true for valid TileJson', () => {
        const tile = {
            idx: 0,
            tileType: 'tileType',
            item: 'item',
            hasPlayer: true,
        };
        expect(service.isValidTileJson(tile)).toBeTruthy();
    });

    it('should return false for invalid TileJson', () => {
        const tile = {
            idx: 'string',
            tileType: 12,
            item: 'item',
            hasPlayer: true,
        };
        expect(service.isValidTileJson(tile as any)).toBeFalsy();
    });

    it('should not add errors for valid GameJson', () => {
        const game = {
            gameName: 'ValidGame',
            id: '123',
            gameDescription: 'A valid game',
            mapSize: '10',
            gameType: 'type',
            creationDate: '2023-01-01',
            map: [],
            isVisible: true,
        };
        service.validateProperties(game);
        expect(service.errors.length).toBe(0);
    });

    it('should add errors for missing properties', () => {
        const game = {};
        service.validateProperties(game as any);
        expect(service.errors.length).toBe(service.propertiesToCheck.length * 2);
    });

    it('should add errors for incorrect property types', () => {
        const game = {
            gameName: 123,
            id: 123,
            gameDescription: 123,
            mapSize: 123,
            gameType: 123,
            creationDate: 123,
            map: [],
            isVisible: 123,
        };
        service.validateProperties(game as any);
        expect(service.errors.length).toBe(service.propertiesToCheck.length);
    });

    it('should add errors for empty map', () => {
        const game = {
            map: [],
        };
        service.validateMap(game as any);
        expect(service.errors.length).toBeGreaterThan(0);
    });

    it('should add errors for invalid map (not an array)', () => {
        const game = { map: 'invalid' };
        service.validateMap(game as any);
        expect(service.errors.length).toBe(1);
    });

    it('should add errors for invalid tiles in the map', () => {
        const game = { map: [{ tileType: 'grass', item: 123 }] };
        service.validateMap(game as any);
        expect(service.errors.length).toBeGreaterThan(0);
    });

    it('should not add errors for valid game name', () => {
        const game = { gameName: 'ValidGame' };
        service.validateGameName(game as any);
        expect(service.errors.length).toBe(0);
    });

    it('should add errors for game name with double spaces or leading/trailing spaces', () => {
        const game = { gameName: ' Invalid Game ' };
        service.validateGameName(game as any);
        expect(service.errors.length).toBe(1);
    });

    it('should add errors for game name with invalid symbols', () => {
        const game = { gameName: 'Invalid/Game!' };
        service.validateGameName(game as any);
        expect(service.errors.length).toBe(1);
    });

    it('should not add errors for unique game name and id', async () => {
        jest.spyOn(model, 'find').mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
        } as unknown as Query<Game[], Game>);
        const game = { gameName: 'UniqueGame', id: 'unique-id' };
        await service.validateUniqueChecks(game as any);
        expect(service.errors.length).toBe(0);
    });

    it('should add errorss for non-unique game name and game id', async () => {
        jest.spyOn(model, 'find').mockReturnValue({
            exec: jest.fn().mockResolvedValue([{}]),
        } as unknown as Query<Game[], Game>);
        const game = { gameName: 'NonUniqueGame', id: 'non-unique-id' };
        await service.validateUniqueChecks(game as any);
        expect(service.errors.length).toBe(2);
    });

    it('should not add errors for valid map services', () => {
        const game = { map: [{}, {}, {}, {}], mapSize: '2' };
        jest.spyOn(mapValidationService, 'hasStartingPoints').mockReturnValue(true);
        jest.spyOn(mapValidationService, 'hasCorrectGroundAmount').mockReturnValue(true);
        jest.spyOn(mapValidationService, 'areAllTilesAccessible').mockReturnValue(true);
        jest.spyOn(mapValidationService, 'areAllDoorsValid').mockReturnValue(true);
        service.validateMapServices(game as any);
        expect(service.errors.length).toBe(0);
    });

    it('should add errors for invalid map services but with valid map size', () => {
        const game = { map: [{}, {}, {}, {}], mapSize: '2' };
        jest.spyOn(mapValidationService, 'hasStartingPoints').mockReturnValue(false);
        jest.spyOn(mapValidationService, 'hasCorrectGroundAmount').mockReturnValue(false);
        jest.spyOn(mapValidationService, 'areAllTilesAccessible').mockReturnValue(false);
        jest.spyOn(mapValidationService, 'areAllDoorsValid').mockReturnValue(false);
        service.validateMapServices(game as any);
        expect(service.errors.length).toBe(4);
    });

    it('should add errors for invalid mapSize', () => {
        const game = { map: [{}, {}], mapSize: '3' };
        service.validateMapServices(game as any);
        expect(service.errors.length).toBe(1);
    });
});
