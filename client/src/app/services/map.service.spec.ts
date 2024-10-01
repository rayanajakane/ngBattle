import { TestBed } from '@angular/core/testing';

import { MapService } from './map.service';

describe('MapService', () => {
    let service: MapService;

    // function randomTileIsBasic(tiles: TileJson[], gridLength: number) {
    //     const randomIndex: number = Math.floor(Math.random() * gridLength);
    //     const singleTile = {
    //         idx: randomIndex, // Unique ID for each tile
    //         tileType: TileTypes.BASIC, // Tile type
    //         item: '',
    //         hasPlayer: false,
    //     };
    //     return tiles[randomIndex] === singleTile;
    // }

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [MapService] });
        service = TestBed.inject(MapService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // it('createGrid should create a tileGrid of basic tiles with DEFAULT_MAP_SIZE if no parameter is given', () => {
    //     service.createGrid();
    //     expect(service.tiles.length).toBe(DEFAULT_MAP_SIZE * DEFAULT_MAP_SIZE);
    //     expect(randomTileIsBasic(service.tiles, DEFAULT_MAP_SIZE * DEFAULT_MAP_SIZE));
    //     expect(service.tiles).toEqual(service.oldTiles);
    // });

    // it('createGrid should create a tileGrid with a size equivalent to the square of the size given', () => {
    //     service.createGrid(5);
    //     expect(service.tiles.length).toBe(25);
    //     expect(randomTileIsBasic(service.tiles, 25));
    // });

    // it('should throw an error when called with a negative number', function () {
    //     const randomNegativeSize: number = -Math.floor(Math.random() * DEFAULT_MAP_SIZE);
    //     expect(function () {
    //         service.createGrid(randomNegativeSize);
    //     }).toThrowError('MapSize must be a positive number.');
    // });

    // it('createGrid should create a tileGrid with a size equivalent to the square of the size given', () => {
    //     service.createGrid(5);
    //     expect(service.tiles.length).toBe(25);
    //     expect(randomTileIsBasic(service.tiles, 25));
    // });

    // it('calling createGrid with a map should not consider the mapSize', () => {
    //     service.createGrid(10); // Create grid with mapSize = 10
    //     const tiles = JSON.parse(JSON.stringify(service.tiles)); // Create deepCopy
    //     const newTiles = Array(5 * 5) // Create grid manually with mapSize = 5
    //         .fill(0)
    //         .map((_, index) => {
    //             return {
    //                 idx: index,
    //                 tileType: TileTypes.BASIC,
    //                 item: '',
    //                 hasPlayer: false,
    //             };
    //         });
    //     service.createGrid(10, newTiles);
    //     expect(service.tiles.length === tiles.length).toBeFalsy();
    //     expect(service.tiles.length).toBe(5 * 5);
    // });

    // it('resetGrid to basic should return the grid to its original state', () => {
    //     service.createGrid(5);
    //     const tiles = JSON.parse(JSON.stringify(service.tiles)); // Create deepCopy
    //     service.setTileType(2, TileTypes.DOORCLOSED);
    //     expect(tiles).not.toEqual(service.tiles);
    //     service.resetGridToBasic();
    //     expect(tiles).toEqual(service.tiles);

    //     const newTiles = Array(5 * 5) // Create grid manually with mapSize = 5
    //         .fill(0)
    //         .map((_, index) => {
    //             return {
    //                 idx: index,
    //                 tileType: TileTypes.BASIC,
    //                 item: '',
    //                 hasPlayer: false,
    //             };
    //         });
    //     service.createGrid(undefined, newTiles);
    //     const newTilesCopy = JSON.parse(JSON.stringify(service.tiles));
    //     service.setTileType(2, TileTypes.DOORCLOSED);
    //     expect(newTilesCopy).not.toEqual(service.tiles);
    //     service.resetGridToBasic();
    //     expect(newTilesCopy).toEqual(service.tiles);
    // });

    // it('createGrid should create a tileGrid with a size equivalent to the square of the size given', () => {
    //     service.createGrid(5);
    //     expect(service.tiles.length).toBe(25);
    //     expect(randomTileIsBasic(service.tiles, 25));
    // });
});
