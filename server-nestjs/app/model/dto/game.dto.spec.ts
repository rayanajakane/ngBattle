import { GameDto } from '@app/model/dto/game/game.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import 'reflect-metadata';

describe('GameDto', () => {
    it('should validate a correct DTO', async () => {
        const gameData = {
            id: '123',
            gameName: 'Game e34wdwd23',
            gameDescription: 'This is an example game description.',
            mapSize: '3',
            map: [
                { idx: 0, tileType: '', item: 'startingPoint', hasPlayer: false },
                { idx: 1, tileType: '', item: 'startingPoint', hasPlayer: false },
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

        const gameDto = plainToInstance(GameDto, gameData);
        const errors = await validate(gameDto);
        console.log(errors);
        expect(errors.length).toBe(0);
    });

    it('should fail validation for an empty ID', async () => {
        const gameData = {
            id: '',
            gameName: 'Game 1',
            gameDescription: 'This is an example game description.',
            mapSize: '3',
            map: [
                { idx: 0, tileType: '', item: 'startingPoint', hasPlayer: false },
                { idx: 1, tileType: '', item: 'startingPoint', hasPlayer: false },
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

        const gameDto = plainToInstance(GameDto, gameData);
        const errors = await validate(gameDto);
        expect(errors.length).not.toBe(0);
        expect(errors).toContain('ID cannot be empty');
    });
});
