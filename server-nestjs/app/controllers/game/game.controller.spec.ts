import { GameDto } from '@app/model/dto/game/game.dto';
import { GameService } from '@app/services/game/game.service';
import 'reflect-metadata';
import { GameController } from './game.controller';

describe('GameController', () => {
    let gameController: GameController;
    let gameService: GameService;
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

    beforeEach(() => {
        gameService = {
            create: jest.fn(),
            update: jest.fn(),
            changeVisibility: jest.fn(),
            delete: jest.fn(),
            get: jest.fn(),
            getAll: jest.fn(),
        } as any;
        gameController = new GameController(gameService);
    });

    describe('uploadGame', () => {
        it('should call gameService.create with correct data', async () => {
            await gameController.uploadGame(gameData);
            expect(gameService.create).toHaveBeenCalledWith(gameData);
        });
    });

    describe('updateGame', () => {
        it('should call gameService.update with correct data', async () => {
            await gameController.updateGame(gameData);
            expect(gameService.update).toHaveBeenCalledWith(gameData);
        });
    });

    describe('changeVisibility', () => {
        it('should call gameService.changeVisibility with correct ID', async () => {
            const id = '123';
            await gameController.changeVisibility(id);
            expect(gameService.changeVisibility).toHaveBeenCalledWith(id);
        });
    });

    describe('deleteGame', () => {
        it('should call gameService.delete with correct ID', async () => {
            const id = '123';
            await gameController.deleteGame(id);
            expect(gameService.delete).toHaveBeenCalledWith(id);
        });
    });

    describe('getGame', () => {
        it('should call gameService.get with correct ID and return the result', async () => {
            const id = '123';
            (gameService.get as jest.Mock).mockResolvedValue(gameData);
            const result = await gameController.getGame(id);
            expect(gameService.get).toHaveBeenCalledWith(id);
            expect(result).toBe(gameData);
        });
    });

    describe('getAllGames', () => {
        it('should call gameService.getAllGames with no parameters and return the result', async () => {
            (gameService.getAll as jest.Mock).mockResolvedValue([gameData]);
            const result = await gameController.getAllGames();
            expect(gameService.getAll).toHaveBeenCalledWith();
            expect(result).toStrictEqual([gameData]);
        });
    });
});
