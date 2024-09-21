import { GameDto } from '@app/model/dto/game/game.dto';
import { Game } from '@app/model/schema/game.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import 'reflect-metadata';
import { GameService } from './game.service';

describe('GameService', () => {
    let service: GameService;
    let gameModel: Model<Game>;
    const gameData: GameDto = {
        id: '1',
        gameName: 'Game 2',
        gameDescription: 'This is an example game description.',
        mapSize: '10x10',
        map: [
            { idx: 0, tileType: 'grass', item: 'item1', hasPlayer: false },
            { idx: 1, tileType: 'water', item: '', hasPlayer: false },
            { idx: 2, tileType: 'sand', item: 'item2', hasPlayer: true },
            { idx: 3, tileType: 'mountain', item: '', hasPlayer: false },
        ],
        gameType: 'ctf',
        isVisible: true,
        creationDate: '2024-09-18T10:30:00.000Z',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameService,
                {
                    provide: getModelToken(Game.name),
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        updateOne: jest.fn(),
                        deleteOne: jest.fn(),
                        save: jest.fn(),
                        exec: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<GameService>(GameService);
        gameModel = module.get(getModelToken(Game.name));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        // FIXME
        // it('should create a new game', async () => {
        //     (gameModel.find as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValueOnce([]) });
        //     await expect(service.create(gameData)).resolves.toEqual({});
        // });
    });

    describe('update', () => {
        it('should update an existing game', async () => {
            (gameModel.findOne as jest.Mock).mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({ id: '123' }) });
            (gameModel.updateOne as jest.Mock).mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({}) });
            await expect(service.update(gameData)).resolves.toEqual({ id: '123' });
        });
    });

    describe('changeVisibility', () => {
        it('should toggle the visibility of a game', async () => {
            (gameModel.findOne as jest.Mock).mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({ _id: '1', isVisible: true }) });
            (gameModel.updateOne as jest.Mock).mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({}) });
            await expect(service.changeVisibility('1')).resolves.toBeUndefined();
        });
    });

    describe('delete', () => {
        it('should delete a game by ID', async () => {
            (gameModel.deleteOne as jest.Mock).mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({}) });
            await expect(service.delete('1')).resolves.toBeUndefined();
        });
    });

    describe('get', () => {
        it('should retrieve a game by ID', async () => {
            (gameModel.findOne as jest.Mock).mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce({}) });
            await expect(service.get('1')).resolves.toEqual({});
        });
    });

    describe('findAll', () => {
        it('should retrieve all games', async () => {
            (gameModel.find as jest.Mock).mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce([{}]) });
            await expect(service.getAll()).resolves.toEqual([{}]);
        });
    });
});
