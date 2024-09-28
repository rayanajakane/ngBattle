import { TestBed } from '@angular/core/testing';

import { TileJson } from '@app/data-structure/game-structure';
import { TileTypes } from '@app/data-structure/tileType';
import { DEFAULT_MAP_SIZE, MapService } from './map.service';

describe('MapService', () => {
    let service: MapService;

    function randomTileIsBasic(tiles: TileJson[], gridLength: number) {
        const randomIndex: number = Math.floor(Math.random() * gridLength);
        const singleTile = {
            idx: randomIndex, // Unique ID for each tile
            tileType: TileTypes.BASIC, // Tile type
            item: '',
            hasPlayer: false,
        };
        return tiles[randomIndex] == singleTile;
    }

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MapService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('createGrid should create a tileGrid of basic tiles with a size equivalent to the square of DEFAULT_MAP_SIZE if no parameter is given', () => {
        service.createGrid();
        expect(service.tiles.length).toBe(DEFAULT_MAP_SIZE * DEFAULT_MAP_SIZE);
        expect(randomTileIsBasic(service.tiles, DEFAULT_MAP_SIZE * DEFAULT_MAP_SIZE));
    });

    it('createGrid should create a tileGrid with a size equivalent to the square of the size given', () => {
        service.createGrid(5);
        expect(service.tiles.length).toBe(25);
        expect(randomTileIsBasic(service.tiles, 25));
    });

    describe('checkPositiveNumber', function () {
        it('should throw an error when called with a negative number', function () {
            const randomNegativeSize: number = -Math.floor(Math.random() * DEFAULT_MAP_SIZE);
            expect(function () {
                service.createGrid(randomNegativeSize);
            }).toThrowError('MapSize must be a positive number.');
        });
    });
});
