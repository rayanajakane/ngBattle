import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { TileInfoModalComponent } from '@app/components/tile-info-modal/tile-info-modal.component';
import { ShortestPathByTile } from '@common/game-structure';
import { BaseStateService } from './base-state.service';
import { GameControllerService } from './game-controller.service';

describe('BaseStateService', () => {
    let service: BaseStateService;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let gameControllerSpy: jasmine.SpyObj<GameControllerService>;

    beforeEach(() => {
        const dialogSpyObj = jasmine.createSpyObj('MatDialog', ['open']);
        const gameControllerSpyObj = jasmine.createSpyObj('GameControllerService', ['isActivePlayer']);

        TestBed.configureTestingModule({
            providers: [
                { provide: MatDialog, useValue: dialogSpyObj },
                { provide: GameControllerService, useValue: gameControllerSpyObj },
            ],
        });

        dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
        gameControllerSpy = TestBed.inject(GameControllerService) as jasmine.SpyObj<GameControllerService>;
        service = TestBed.inject(BaseStateService);
    });

    it('should set available tiles', () => {
        const tiles = [1, 2, 3];
        service.setAvailableTiles(tiles);
        expect(service.getAvailableTiles()).toEqual(tiles);
    });

    it('should reset available tiles', () => {
        service.setAvailableTiles([1, 2, 3]);
        service.resetAvailableTiles();
        expect(service.getAvailableTiles()).toEqual([]);
    });

    it('should check if available tiles include a specific index', () => {
        service.setAvailableTiles([1, 2, 3]);
        expect(service.availablesTilesIncludes(2)).toBeTrue();
        expect(service.availablesTilesIncludes(4)).toBeFalse();
    });

    it('should set and get shortest path by tile', () => {
        const shortestPath: ShortestPathByTile = { 1: [2, 3] };
        service.setShortestPathByTile(shortestPath);
        expect(service.getShortestPathByTile()).toEqual(shortestPath);
    });

    it('should reset shortest path by tile', () => {
        service.setShortestPathByTile({ 1: [2, 3] });
        service.resetShortestPathByTile();
        expect(service.getShortestPathByTile()).toEqual({});
    });

    it('should reset movement previsualization', () => {
        service.setAvailableTiles([1, 2, 3]);
        service.setShortestPathByTile({ 1: [2, 3] });
        service.resetMovementPrevisualization();
        expect(service.getAvailableTiles()).toEqual([]);
        expect(service.getShortestPathByTile()).toEqual({});
    });

    it('should open dialog on right click if active player', () => {
        const tile = { id: 1, name: 'Tile 1' } as any;
        gameControllerSpy.isActivePlayer.and.returnValue(true);
        service.onRightClick(tile);
        expect(dialogSpy.open).toHaveBeenCalledWith(TileInfoModalComponent, { data: { tile: tile } });
    });

    it('should not open dialog on right click if not active player', () => {
        const tile = { id: 1, name: 'Tile 1' } as any;
        gameControllerSpy.isActivePlayer.and.returnValue(false);
        service.onRightClick(tile);
        expect(dialogSpy.open).not.toHaveBeenCalled();
    });

    it('should get shortest path by index', () => {
        const shortestPath: ShortestPathByTile = { 1: [2, 3], 2: [3, 4] };
        service.setShortestPathByTile(shortestPath);
        expect(service.getShortestPathByIndex(1)).toEqual([2, 3]);
        expect(service.getShortestPathByIndex(2)).toEqual([3, 4]);
    });

    it('should return undefined for non-existing index in shortest path', () => {
        const shortestPath: ShortestPathByTile = { 1: [2, 3] };
        service.setShortestPathByTile(shortestPath);
        expect(service.getShortestPathByIndex(3)).toBeUndefined();
    });
});
