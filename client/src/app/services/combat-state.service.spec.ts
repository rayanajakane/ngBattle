import { TestBed } from '@angular/core/testing';

import { GameState, ShortestPathByTile } from '@common/game-structure';
import { CombatStateService } from './combat-state.service';

describe('CombatStateService', () => {
    let service: CombatStateService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CombatStateService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize previsualization', () => {
        const accessibleTiles: ShortestPathByTile = {
            /* mock data */
        };
        spyOn(console, 'log');
        service.initializePrevisualization(accessibleTiles);
        expect(console.log).toHaveBeenCalledWith('You are in combat', accessibleTiles);
    });

    it('should return GameState.COMBAT on mouse down', () => {
        spyOn(console, 'log');
        const result = service.onMouseDown();
        expect(result).toBe(GameState.COMBAT);
        expect(console.log).toHaveBeenCalledWith('You are in combat');
    });

    it('should log message on mouse enter', () => {
        spyOn(console, 'log');
        service.onMouseEnter();
        expect(console.log).toHaveBeenCalledWith('You are in combat');
    });
});
