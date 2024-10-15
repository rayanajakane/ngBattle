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
});
