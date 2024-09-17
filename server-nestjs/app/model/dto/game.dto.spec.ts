import { plainToClass } from 'class-transformer';
import { GameDto } from '../dto/game/game.dto';
import { TileDto } from '../dto/game/tile.dto';

describe('GameDto', () => {
    it('should transform plain objects to TileDto instances', () => {
        const plainGame = {
            id: '123',
            gameName: 'test game',
            gameDescription: 'This is an example game description.',
            mapSize: '10x10',
            map: [
                { i: 0, j: 0, tileType: 'grass', item: 'item1', hasPlayer: false },
                { i: 0, j: 1, tileType: 'water', item: '', hasPlayer: false },
                { i: 1, j: 0, tileType: 'sand', item: 'item2', hasPlayer: true },
                { i: 1, j: 1, tileType: 'mountain', item: '', hasPlayer: false },
            ],
            gameType: 'ctf',
            isVisible: true,
        };

        const gameDto = plainToClass(GameDto, plainGame);

        // Check that map is an array of TileDto instances
        expect(gameDto.map).toBeInstanceOf(Array);
        expect(gameDto.map[0]).toBeInstanceOf(TileDto);
        expect(gameDto.map[1]).toBeInstanceOf(TileDto);
        // ... check other map items as needed

        // Optionally, check if the transformation is accurate
        expect(gameDto.map[0].i).toBe(0);
        expect(gameDto.map[0].tileType).toBe('grass');
        expect(gameDto.map[0].hasPlayer).toBe(false);
    });
});
