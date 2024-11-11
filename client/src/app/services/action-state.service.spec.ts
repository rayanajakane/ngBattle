import { TestBed } from '@angular/core/testing';

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
});
