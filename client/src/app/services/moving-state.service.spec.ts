import { TestBed } from '@angular/core/testing';

import { GameState, ShortestPathByTile } from '@common/game-structure';
import { BaseStateService } from './base-state.service';
import { MovingStateService } from './moving-state.service';

describe('MovingStateService', () => {
    let service: MovingStateService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [MovingStateService, { provide: BaseStateService, useValue: {} }],
        });
        service = TestBed.inject(MovingStateService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize previsualization', () => {
        const accessibleTiles: ShortestPathByTile = { 1: [], 2: [] };
        spyOn(service, 'setAvailableTiles');
        spyOn(service, 'setShortestPathByTile');

        service.initializePrevisualization(accessibleTiles);

        expect(service.setAvailableTiles).toHaveBeenCalledWith([1, 2]);
        expect(service.setShortestPathByTile).toHaveBeenCalledWith(accessibleTiles);
    });

    it('should handle onMouseDown with available tile', () => {
        spyOn(service, 'availablesTilesIncludes').and.returnValue(true);
        spyOn(service, 'resetMovementPrevisualization');
        spyOn(service.gameController, 'requestMove');

        const result = service.onMouseDown(1);

        expect(service.resetMovementPrevisualization).toHaveBeenCalled();
        expect(service.gameController.requestMove).toHaveBeenCalledWith(1);
        expect(result).toBe(GameState.NOTPLAYING);
    });

    it('should handle onMouseDown with unavailable tile', () => {
        spyOn(service, 'availablesTilesIncludes').and.returnValue(false);

        const result = service.onMouseDown(1);

        expect(result).toBe(GameState.MOVING);
    });

    it('should handle onMouseEnter', () => {
        spyOn(console, 'log');

        service.onMouseEnter();

        expect(console.log).toHaveBeenCalledWith('You are moving');
    });
});
