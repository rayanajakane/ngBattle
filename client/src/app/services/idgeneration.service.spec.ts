import { TestBed } from '@angular/core/testing';

import { IDgenerationService } from './idgeneration.service';

describe('IDgenerationService', () => {
  let service: IDgenerationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IDgenerationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
