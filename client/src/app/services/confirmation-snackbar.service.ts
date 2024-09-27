import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SNACKBAR_DURATION } from './constants';

@Injectable({
    providedIn: 'root',
})
export class ConfirmationSnackbarService {
    constructor(private snackBar: MatSnackBar) {}

    openSnackBar(message: string, action: string = 'Close') {
        this.snackBar.open(message, action, {
            duration: SNACKBAR_DURATION,
            horizontalPosition: 'right',
            verticalPosition: 'top',
        });
    }
}
