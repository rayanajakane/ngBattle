import { TestBed } from '@angular/core/testing';
import { TilePreview } from '@app/data-structure/game-structure';
import { ItemTypes } from '@app/data-structure/toolType';
import { Player, PlayerAttribute } from '@app/interfaces/player';
import { MapGameService } from './map-game.service';

const player1: Player = {
    id: '1',
    name: 'player1',
    isAdmin: false,
    avatar: '1',
    attributes: {} as PlayerAttribute,
    isActive: false,
    abandoned: true,
    wins: 0,
};

/* eslint-disable */ // Magic numbers are used for testing purposes
const SHORTESTPATHINDEXES1 = [0, 1, 2];
const SHORTESTPATHINDEXES2 = [4, 5, 6];
/* eslint-enable */

describe('MapGameService', () => {
    let service: MapGameService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MapGameService);
        service.tiles = [
            {
                player: player1,
                isAccessible: TilePreview.NONE,
                idx: 0,
                tileType: '',
                item: '',
                hasPlayer: false,
            },
            {
                player: player1,
                isAccessible: TilePreview.NONE,
                idx: 1,
                tileType: '',
                item: '',
                hasPlayer: false,
            },
            {
                player: player1,
                isAccessible: TilePreview.NONE,
                idx: 2,
                tileType: '',
                item: '',
                hasPlayer: false,
            },
        ];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set preview for given indexes', () => {
        const indexes = SHORTESTPATHINDEXES1;
        const previewType = TilePreview.PREVIEW;

        service.renderPreview(indexes, previewType);

        indexes.forEach((index) => {
            expect(service.tiles[index].isAccessible).toBe(previewType);
        });
    });
    it('should remove all previews', () => {
        service.tiles[0].isAccessible = TilePreview.PREVIEW;
        service.tiles[1].isAccessible = TilePreview.SHORTESTPATH;
        service.tiles[2].isAccessible = TilePreview.PREVIEW;
        /* eslint-disable */
        service.shortestPathByTile = {
            1: SHORTESTPATHINDEXES1,
        };
        /* eslint-enable */

        service.removeAllPreview();

        service.tiles.forEach((tile) => {
            expect(tile.isAccessible).toBe(TilePreview.NONE);
        });
    });
    it('should reset shortest path', () => {
        /* eslint-disable */

        service.shortestPathByTile = {
            1: SHORTESTPATHINDEXES1,
            2: SHORTESTPATHINDEXES2,
        };
        /* eslint-enable */
        service.resetShortestPath();
        expect(service.shortestPathByTile).toEqual({});
    });
    it('should set shortest path for given index', () => {
        const index = 1;
        /* eslint-disable */
        service.shortestPathByTile = {
            1: SHORTESTPATHINDEXES1,
        };
        /* eslint-enable */
        service.renderShortestPath(index);

        service.shortestPathByTile[index].forEach((tileIndex) => {
            expect(service.tiles[tileIndex].isAccessible).toBe(TilePreview.SHORTESTPATH);
        });
    });

    it('should emit event with the given value', (done) => {
        const value = 5;
        service.event$.subscribe((emittedValue) => {
            expect(emittedValue).toBe(value);
            done();
        });

        service.emitEvent(value);
    });
    it('should set available tiles', () => {
        const availableTiles = [1, 2, 3, 4, 5];
        service.setAvailableTiles(availableTiles);
        expect(service.availableTiles).toEqual(availableTiles);
    });
    it('should set shortest path by tile', () => {
        const shortestPathByTile = {
            1: SHORTESTPATHINDEXES1,
            2: SHORTESTPATHINDEXES2,
        };
        service.setShortestPathByTile(shortestPathByTile);
        expect(service.shortestPathByTile).toEqual(shortestPathByTile);
    });
    it('should handle onMouseDown event correctly', () => {
        const index = 1;
        const event = new MouseEvent('mousedown', { button: 0 });
        service.setAvailableTiles([index]);
        service.isMoving = false;

        spyOn(service, 'emitEvent');

        service.onMouseDown(index, event);

        expect(service.isMoving).toBe(true);
        expect(service.emitEvent).toHaveBeenCalledWith(index);
    });

    it('should not handle onMouseDown event if button is not left click', () => {
        const index = 1;
        const event = new MouseEvent('mousedown', { button: 1 });
        service.setAvailableTiles([index]);
        service.isMoving = false;

        spyOn(service, 'emitEvent');

        service.onMouseDown(index, event);

        expect(service.isMoving).toBe(false);
        expect(service.emitEvent).not.toHaveBeenCalled();
    });

    it('should not handle onMouseDown event if index is not in availableTiles', () => {
        const index = 1;
        const event = new MouseEvent('mousedown', { button: 0 });
        service.setAvailableTiles([]);
        service.isMoving = false;

        spyOn(service, 'emitEvent');

        service.onMouseDown(index, event);

        expect(service.isMoving).toBe(false);
        expect(service.emitEvent).not.toHaveBeenCalled();
    });

    it('should not handle onMouseDown event if already moving', () => {
        const index = 1;
        const event = new MouseEvent('mousedown', { button: 0 });
        service.setAvailableTiles([index]);
        service.isMoving = true;

        spyOn(service, 'emitEvent');

        service.onMouseDown(index, event);

        expect(service.isMoving).toBe(true);
        expect(service.emitEvent).not.toHaveBeenCalled();
    });
    it('should render shortest path on mouse enter', () => {
        const index = 1;
        const event = new MouseEvent('mouseenter');
        service.setAvailableTiles([index]);
        service.shortestPathByTile = {
            1: SHORTESTPATHINDEXES1,
        };

        spyOn(service, 'renderShortestPath');

        service.onMouseEnter(index, event);

        expect(service.renderShortestPath).toHaveBeenCalledWith(index);
    });
    it('should reset shortest path', () => {
        service.shortestPathByTile = {
            1: SHORTESTPATHINDEXES1,
            2: SHORTESTPATHINDEXES2,
        };

        service.resetShortestPath();

        expect(service.shortestPathByTile).toEqual({});
    });
    it('should render available tiles', () => {
        const availableTiles = [0, 1, 2];
        service.setAvailableTiles(availableTiles);

        spyOn(service, 'renderPreview');

        service.renderAvailableTiles();

        expect(service.renderPreview).toHaveBeenCalledWith(availableTiles, TilePreview.PREVIEW);
    });
    it('should place player on the given index', () => {
        const index = 1;
        service.placePlayer(index, player1);

        expect(service.tiles[index].player).toEqual(player1);
        expect(service.tiles[index].hasPlayer).toBe(true);
    });
    it('should remove player from the given index', () => {
        const index = 1;
        service.placePlayer(index, player1);

        service.removePlayer(index);

        expect(service.tiles[index].player).toBeUndefined();
        expect(service.tiles[index].hasPlayer).toBe(false);
    });
    it('should find player index', () => {
        const index = service.findPlayerIndex(player1);
        expect(index).toBe(0);
    });
    it('should change player position from old index to new index', () => {
        const oldIndex = 0;
        const newIndex = 1;
        service.placePlayer(oldIndex, player1);

        service.changePlayerPosition(oldIndex, newIndex, player1);

        expect(service.tiles[oldIndex].player).toBeUndefined();
        expect(service.tiles[oldIndex].hasPlayer).toBe(false);
        expect(service.tiles[newIndex].player).toEqual(player1);
        expect(service.tiles[newIndex].hasPlayer).toBe(true);
    });
    it('should remove unused starting points', () => {
        service.tiles = [
            {
                player: undefined,
                isAccessible: TilePreview.NONE,
                idx: 0,
                tileType: '',
                item: ItemTypes.STARTINGPOINT,
                hasPlayer: false,
            },
            {
                player: player1,
                isAccessible: TilePreview.NONE,
                idx: 1,
                tileType: '',
                item: ItemTypes.STARTINGPOINT,
                hasPlayer: true,
            },
            {
                player: undefined,
                isAccessible: TilePreview.NONE,
                idx: 2,
                tileType: '',
                item: ItemTypes.STARTINGPOINT,
                hasPlayer: false,
            },
        ];

        service.removeUnusedStartingPoints();

        expect(service.tiles[0].item).toBe('');
        expect(service.tiles[1].item).toBe(ItemTypes.STARTINGPOINT);
        expect(service.tiles[2].item).toBe('');
    });
});
