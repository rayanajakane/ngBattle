import { TestBed } from '@angular/core/testing';
import { ItemTypes, TileTypes } from '@app/data-structure/toolType';
import { TilePreview } from '@common/game-structure';
import { Player, PlayerAttribute } from '@common/player';
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
const shortestPathIndexes1 = [0, 1, 2];
const shortestPathIndexes2 = [4, 5, 6];
const availableTiles = [1, 2, 3, 4, 5];
const availableTiles2 = [0, 1, 2];

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
        const indexes = shortestPathIndexes1;
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
            1: shortestPathIndexes1,
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
            1: shortestPathIndexes1,
            2: shortestPathIndexes2,
        };
        /* eslint-enable */
        service.resetShortestPath();
        expect(service.shortestPathByTile).toEqual({});
    });
    it('should set shortest path for given index', () => {
        const index = 1;
        /* eslint-disable */
        service.shortestPathByTile = {
            1: shortestPathIndexes1,
        };
        /* eslint-enable */
        service.renderPathToTarget(index);

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
        service.setAvailableTiles(availableTiles);
        expect(service.availableTiles).toEqual(availableTiles);
    });
    it('should set shortest path by tile', () => {
        const shortestPathByTile = {
            /* eslint-disable */
            1: shortestPathIndexes1,
            2: shortestPathIndexes2,
            /* eslint-enable */
        };
        service.setShortestPathByTile(shortestPathByTile);
        expect(service.shortestPathByTile).toEqual(shortestPathByTile);
    });
    it('should start moving if left button is clicked on an available tile', () => {
        const index = 1;
        const event = new MouseEvent('mousedown', { button: 0 });
        service.setAvailableTiles([index]);

        spyOn(service, 'emitEvent');

        service.onMouseDown(index, event);

        expect(service.isMoving).toBe(true);
        expect(service.emitEvent).toHaveBeenCalledWith(index);
    });

    it('should not start moving if left button is clicked on a non-available tile', () => {
        const index = 1;
        const event = new MouseEvent('mousedown', { button: 0 });
        service.setAvailableTiles([]);

        spyOn(service, 'emitEvent');

        service.onMouseDown(index, event);

        expect(service.isMoving).toBe(false);
        expect(service.emitEvent).not.toHaveBeenCalled();
    });

    it('should perform door action if left button is clicked on a door tile', () => {
        const index = 1;
        const event = new MouseEvent('mousedown', { button: 0 });
        service.tiles[index].tileType = TileTypes.DOORCLOSED;

        spyOn(service, 'emitEvent');

        service.onMouseDown(index, event);

        expect(service.actionDoor).toBe(true);
        expect(service.emitEvent).toHaveBeenCalledWith(index);
    });

    it('should not perform any action if right button is clicked', () => {
        const index = 1;
        const event = new MouseEvent('mousedown', { button: 2 });

        spyOn(service, 'emitEvent');

        service.onMouseDown(index, event);

        expect(service.isMoving).toBe(false);
        expect(service.actionDoor).toBe(false);
        expect(service.emitEvent).not.toHaveBeenCalled();
    });
    it('should render shortest path on mouse enter', () => {
        const index = 1;
        const event = new MouseEvent('mouseenter');
        service.setAvailableTiles([index]);
        service.shortestPathByTile = {
            /* eslint-disable */
            1: shortestPathIndexes1,
            /* eslint-enable */
        };

        spyOn(service, 'renderShortestPath');

        service.onMouseEnter(index, event);

        expect(service.renderPathToTarget).toHaveBeenCalledWith(index);
    });
    it('should reset shortest path', () => {
        service.shortestPathByTile = {
            /* eslint-disable */
            1: shortestPathIndexes1,
            2: shortestPathIndexes2,
            /* eslint-enable */
        };

        service.resetShortestPath();

        expect(service.shortestPathByTile).toEqual({});
    });
    it('should render available tiles', () => {
        service.setAvailableTiles(availableTiles2);

        spyOn(service, 'renderPreview');

        service.renderAvailableTiles();

        expect(service.renderPreview).toHaveBeenCalledWith(availableTiles2, TilePreview.PREVIEW);
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
    it('should toggle door state from closed to open and vice versa', () => {
        const index = 1;
        service.tiles[index].tileType = TileTypes.DOORCLOSED;

        service.toggleDoor(index);
        expect(service.tiles[index].tileType).toBe(TileTypes.DOOROPEN);

        service.toggleDoor(index);
        expect(service.tiles[index].tileType).toBe(TileTypes.DOORCLOSED);
    });
    it('should prevent default action on mouse up', () => {
        const index = 1;
        const event = new MouseEvent('mouseup');
        spyOn(event, 'preventDefault');

        service.onMouseUp(index, event);

        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should handle right click', () => {
        const index = 1;
        spyOn(service, 'onRightClick').and.callThrough();

        service.onRightClick(index);

        expect(service.onRightClick).toHaveBeenCalledWith(index);
    });

    it('should handle exit', () => {
        spyOn(service, 'onExit').and.callThrough();

        service.onExit();

        expect(service.onExit).toHaveBeenCalled();
    });
    it('should handle drop', () => {
        const index = 1;
        spyOn(service, 'onDrop').and.callThrough();

        service.onDrop(index);

        expect(service.onDrop).toHaveBeenCalledWith(index);
    });
});
