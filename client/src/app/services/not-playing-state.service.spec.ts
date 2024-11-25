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
        const result = service.onMouseDown();
        expect(result).toBe(GameState.NOTPLAYING);
    });
});
