import { GameDto } from '@app/model/dto/game/game.dto';
import { GameService } from '@app/services/game/game.service';
import { Test, TestingModule } from '@nestjs/testing';
import { GameController } from './game.controller';

describe('GameController', () => {
    let gameController: GameController;
    let gameService: GameService;

    const gameData: GameDto = {
        id: '123',
        gameName: 'Game e34wdwd23',
        gameDescription: 'This is an example game description.',
        mapSize: '3',
        map: [
            { idx: 0, tileType: '', item: '', hasPlayer: false },
            { idx: 1, tileType: '', item: '', hasPlayer: false },
            { idx: 2, tileType: '', item: '', hasPlayer: false },
            { idx: 3, tileType: 'wall', item: '', hasPlayer: false },
            { idx: 4, tileType: 'door', item: '', hasPlayer: false },
            { idx: 5, tileType: 'wall', item: '', hasPlayer: false },
            { idx: 6, tileType: '', item: '', hasPlayer: false },
            { idx: 7, tileType: '', item: '', hasPlayer: false },
            { idx: 8, tileType: '', item: '', hasPlayer: false },
        ],
        gameType: 'ctf',
        isVisible: true,
        creationDate: '2024-09-18T10:30:00.000Z',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameController],
            providers: [
                {
                    provide: GameService,
                    useValue: {
                        create: jest.fn(),
                        update: jest.fn(),
                        changeVisibility: jest.fn(),
                        delete: jest.fn(),
                        get: jest.fn(),
                        getAll: jest.fn(),
                    },
                },
            ],
        }).compile();

        gameController = module.get<GameController>(GameController);
        gameService = module.get<GameService>(GameService);
    });

    it('should be defined', () => {
        expect(gameController).toBeDefined();
    });

    it('should call create method of gameService', async () => {
        await gameController.uploadGame(gameData);
        expect(gameService.create).toHaveBeenCalledWith(gameData);
    });

    it('should call update method of gameService', async () => {
        await gameController.updateGame(gameData);
        expect(gameService.update).toHaveBeenCalledWith(gameData);
    });

    it('should call changeVisibility method of gameService', async () => {
        await gameController.changeVisibility('123');
        expect(gameService.changeVisibility).toHaveBeenCalledWith('123');
    });

    it('should call delete method of gameService', async () => {
        await gameController.deleteGame('123');
        expect(gameService.delete).toHaveBeenCalledWith('123');
    });

    it('should call get method of gameService', async () => {
        await gameController.getGame('123');
        expect(gameService.get).toHaveBeenCalledWith('123');
    });

    it('should call getAll method of gameService', async () => {
        await gameController.getAllGames();
        expect(gameService.getAll).toHaveBeenCalled();
    });
});
