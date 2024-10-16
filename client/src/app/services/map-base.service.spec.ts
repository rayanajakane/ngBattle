import { TestBed } from '@angular/core/testing';

import { MapBaseService } from './map-base.service';

describe('MapBaseService', () => {
    let service: MapBaseService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MapBaseService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
