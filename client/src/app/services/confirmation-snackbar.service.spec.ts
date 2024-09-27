import { TestBed } from '@angular/core/testing';

import { ConfirmationSnackbarService } from './confirmation-snackbar.service';

describe('ConfirmationSnackbarService', () => {
    let service: ConfirmationSnackbarService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ConfirmationSnackbarService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
