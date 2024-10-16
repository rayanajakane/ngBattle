import { TestBed } from '@angular/core/testing';

import { EditGameService } from './edit-game.service';

describe('EditGameService', () => {
  let service: EditGameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditGameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
