import { TestBed } from '@angular/core/testing';

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
});
