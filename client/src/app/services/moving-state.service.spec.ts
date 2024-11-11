import { TestBed } from '@angular/core/testing';

import { MovingStateService } from './moving-state.service';

describe('MovingStateService', () => {
  let service: MovingStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MovingStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
