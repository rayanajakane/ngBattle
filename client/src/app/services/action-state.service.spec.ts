import { TestBed } from '@angular/core/testing';

import { GameState } from '@common/game-structure';
import { ActionStateService } from './action-state.service';

describe('ActionStateService', () => {
    let service: ActionStateService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ActionStateService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize previsualization with accessible tiles', () => {
        const accessibleTiles = [1, 2, 3];
        spyOn(service, 'setAvailableTiles');
        service.initializePrevisualization(accessibleTiles);
        expect(service.setAvailableTiles).toHaveBeenCalledWith(accessibleTiles);
    });

    it('should return NOTPLAYING state on mouse down if tile is accessible', () => {
        spyOn(service, 'availablesTilesIncludes').and.returnValue(true);
        spyOn(service.gameController, 'requestAction');
        const result = service.onMouseDown(1);
        expect(service.availablesTilesIncludes).toHaveBeenCalledWith(1);
        expect(service.gameController.requestAction).toHaveBeenCalledWith(1);
        expect(result).toBe(GameState.NOTPLAYING);
    });

    it('should return MOVING state on mouse down if tile is not accessible', () => {
        spyOn(service, 'availablesTilesIncludes').and.returnValue(false);
        const result = service.onMouseDown(1);
        expect(service.availablesTilesIncludes).toHaveBeenCalledWith(1);
        expect(result).toBe(GameState.MOVING);
    });

    it('should log message on mouse enter', () => {
        spyOn(console, 'log');
        service.onMouseEnter();
        expect(console.log).toHaveBeenCalledWith('You are doing action');
    });
});
