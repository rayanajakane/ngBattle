import { TestBed } from '@angular/core/testing';
import { Player, PlayerAttribute } from '@app/interfaces/player';
import { TilePreview } from '../data-structure/game-structure';
import { MapGameService } from './map-game.service';

const player1: Player = {
    id: '1',
    name: 'player1',
    isAdmin: false,
    avatar: '1',
    attributes: {} as PlayerAttribute,
    isActive: false,
    abandoned: true,
};

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
    it('should set accessible tiles and shortest path on mouse enter', () => {
        const index = 1;
        spyOn(service, 'setAccessibleTiles');
        spyOn(service, 'setShortestPath');

        service.onMouseEnter(index, new MouseEvent('mouseenter'));

        expect(service.setAccessibleTiles).toHaveBeenCalled();
        expect(service.setShortestPath).toHaveBeenCalledWith(index);
    });

    it('should remove all previews on exit', () => {
        spyOn(service, 'removeAllPreview');

        service.onExit();

        expect(service.removeAllPreview).toHaveBeenCalled();
    });
    it('should set preview for given indexes', () => {
        const indexes = [0, 1, 2];
        const previewType = TilePreview.PREVIEW;

        service.setPreview(indexes, previewType);

        indexes.forEach((index) => {
            expect(service.tiles[index].isAccessible).toBe(previewType);
        });
    });
    it('should remove all previews', () => {
        service.tiles[0].isAccessible = TilePreview.PREVIEW;
        service.tiles[1].isAccessible = TilePreview.SHORTESTPATH;
        service.tiles[2].isAccessible = TilePreview.PREVIEW;
        service.shortestPathByTile = {
            1: [0, 1, 2],
        };

        service.removeAllPreview();

        service.tiles.forEach((tile) => {
            expect(tile.isAccessible).toBe(TilePreview.NONE);
        });
    });
    it('should reset shortest path', () => {
        service.shortestPathByTile = {
            1: [1, 2, 3],
            2: [4, 5, 6],
        };
        service.resetShortestPath();
        expect(service.shortestPathByTile).toEqual({});
    });
    it('should set shortest path for given index', () => {
        const index = 1;
        service.shortestPathByTile = {
            1: [0, 1, 2],
        };

        service.setShortestPath(index);

        service.shortestPathByTile[index].forEach((tileIndex) => {
            expect(service.tiles[tileIndex].isAccessible).toBe(TilePreview.SHORTESTPATH);
        });
    });
    it('should set accessible tiles', () => {
        spyOn(service, 'setPreview');
        service.accessibleTiles = [0, 1, 2];

        service.setAccessibleTiles();

        expect(service.setPreview).toHaveBeenCalledWith(service.accessibleTiles, TilePreview.PREVIEW);
    });
});
