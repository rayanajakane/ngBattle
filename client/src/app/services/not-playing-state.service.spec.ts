import { TestBed } from '@angular/core/testing';
import { GameState } from '@common/game-structure';
import { NotPlayingStateService } from './not-playing-state.service';

describe('NotPlayingStateService', () => {
    let service: NotPlayingStateService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(NotPlayingStateService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should log message and return NOTPLAYING state on onMouseDown', () => {
        spyOn(console, 'log');
        const result = service.onMouseDown();
        expect(console.log).toHaveBeenCalledWith('You are doing nothing');
        expect(result).toBe(GameState.NOTPLAYING);
    });

    it('should log message on onMouseEnter', () => {
        spyOn(console, 'log');
        service.onMouseEnter();
        expect(console.log).toHaveBeenCalledWith('You are doing nothing');
    });

    it('should log message and accessibleTiles on initializePrevisualization', () => {
        spyOn(console, 'log');
        const accessibleTiles = [1, 2, 3];
        service.initializePrevisualization(accessibleTiles);
        expect(console.log).toHaveBeenCalledWith('You are doing nothing', accessibleTiles);
    });
});
