import { TestBed } from '@angular/core/testing';

import { MapGameService } from './map-game.service';

describe('MapGameService', () => {
    let service: MapGameService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MapGameService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('should handle onRightClick', () => {
        service.onRightClick(0);
        expect(true).toBeTruthy();
    });

    it('should handle onMouseDown', () => {
        const event = new MouseEvent('mousedown');
        service.onMouseDown(0, event);
        expect(true).toBeTruthy();
    });

    it('should handle onMouseUp', () => {
        const event = new MouseEvent('mouseup');
        service.onMouseUp(0, event);
        expect(true).toBeTruthy();
    });

    it('should handle onDrop', () => {
        service.onDrop(0);
        expect(true).toBeTruthy();
    });

    it('should handle onMouseEnter', () => {
        const event = new MouseEvent('mouseenter');
        service.onMouseEnter(0, event);
        expect(true).toBeTruthy();
    });

    it('should handle onExit', () => {
        service.onExit();
        expect(true).toBeTruthy();
    });
});
