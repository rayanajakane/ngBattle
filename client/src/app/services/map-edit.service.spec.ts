import { TestBed } from '@angular/core/testing';

import { MapEditService } from './map-edit.service';

describe('MapEditService', () => {
  let service: MapEditService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapEditService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
