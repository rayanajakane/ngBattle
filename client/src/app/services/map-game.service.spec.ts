import { TestBed } from '@angular/core/testing';
import { TilePreview } from '@app/data-structure/game-structure';
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

    it('should remove all previews on exit', () => {
        spyOn(service, 'removeAllPreview');

        service.onExit();

        expect(service.removeAllPreview).toHaveBeenCalled();
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
    // it('should set accessible tiles', () => {
    //     spyOn(service, 'setPreview');
    //     service.availableTiles = SHORTESTPATHINDEXES1;

    //     service.renderAvailableTiles();

    //     expect(service.renderPreview).toHaveBeenCalledWith(service.availableTiles, TilePreview.PREVIEW);
    // });
});
