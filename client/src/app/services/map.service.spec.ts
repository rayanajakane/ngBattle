import { TestBed } from '@angular/core/testing';

import { DEFAULT_MAP_SIZE } from '@app/components/map/constants';
import { TileJson } from '@app/data-structure/game-structure';
import { TileTypes } from '@app/data-structure/toolType';
import { MapService } from './map.service';

describe('MapService', () => {
    let service: MapService;

    function randomTileIsBasic(tiles: TileJson[], gridLength: number) {
        const randomIndex: number = Math.floor(Math.random() * gridLength);
        const singleTile = {
            idx: randomIndex, // Unique ID for each tile
            tileType: TileTypes.BASIC, // Tile type
            item: '',
            hasPlayer: false,
        } as TileJson;

        const tileFromGrid = tiles[randomIndex];

        return (
            tileFromGrid.idx === singleTile.idx &&
            tileFromGrid.tileType === singleTile.tileType &&
            tileFromGrid.item === singleTile.item &&
            tileFromGrid.hasPlayer === singleTile.hasPlayer
        );
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [MapService] });
        service = TestBed.inject(MapService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('createGrid should create a tileGrid of basic tiles with DEFAULT_MAP_SIZE if no parameter is given', () => {
        const tiles = service.createGrid();
        expect(tiles.length).toBe(DEFAULT_MAP_SIZE * DEFAULT_MAP_SIZE);
        expect(randomTileIsBasic(tiles, DEFAULT_MAP_SIZE * DEFAULT_MAP_SIZE)).toBeTrue();
    });

    it('createGrid should create a tileGrid with a size equivalent to the square of the size given', () => {
        const randomMapSize = Math.floor(Math.random() * DEFAULT_MAP_SIZE) + 1;
        const tiles = service.createGrid(randomMapSize);
        expect(tiles.length).toBe(randomMapSize * randomMapSize);
        expect(randomTileIsBasic(tiles, randomMapSize * randomMapSize)).toBeTrue();
    });

    it('createGrid should throw an error when called with a negative number', function () {
        expect(function () {
            service.createGrid(-Math.floor(Math.random() * DEFAULT_MAP_SIZE));
        }).toThrowError('MapSize must be a positive number.');
    });

    it('chooseTileType should return newTileType if not a door', () => {
        const possibleCurrentTileType = ['', 'wall', 'doorOpen', 'doorClosed', 'water', 'ice'];
        const possibleNewTileTypes = ['', 'wall', 'water', 'ice'];
        const currentTileType = possibleCurrentTileType[Math.floor(Math.random() * possibleCurrentTileType.length)];
        const newTileType = possibleNewTileTypes[Math.floor(Math.random() * possibleNewTileTypes.length)];

        expect(service.chooseTileType(currentTileType, newTileType)).toBe(newTileType);
    });

    it('chooseTileType should return newTileType if not a door', () => {
        const possibleCurrentTileType = ['', 'wall', 'doorOpen', 'doorClosed', 'water', 'ice'];
        const possibleNewTileTypes = ['', 'wall', 'water', 'ice'];
        const currentTileType = possibleCurrentTileType[Math.floor(Math.random() * possibleCurrentTileType.length)];
        const newTileType = possibleNewTileTypes[Math.floor(Math.random() * possibleNewTileTypes.length)];

        expect(service.chooseTileType(currentTileType, newTileType)).toBe(newTileType);
    });

    it('chooseTileType should return doorclosed if newTileType is door and current is not doorclosed', () => {
        const possibleCurrentTileType = ['', 'wall', 'doorOpen', 'water', 'ice'];
        const currentTileType = possibleCurrentTileType[Math.floor(Math.random() * possibleCurrentTileType.length)];
        const newTileType = TileTypes.DOOR;

        expect(service.chooseTileType(currentTileType, newTileType)).toBe(TileTypes.DOORCLOSED);
    });

    it('chooseTileType should return dooropen if newTileType is door and current is doorclosed', () => {
        const currentTileType = TileTypes.DOORCLOSED;
        const newTileType = TileTypes.DOOR;

        expect(service.chooseTileType(currentTileType, newTileType)).toBe(TileTypes.DOOROPEN);
    });
});
