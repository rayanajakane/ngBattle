import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root',
})
export class ConfirmationSnackbarService {
    constructor(private snackBar: MatSnackBar) {}

    openSnackBar(message: string, action: string = 'Close', duration: number = 5000) {
        this.snackBar.open(message, action, {
            duration, // Set custom duration
            horizontalPosition: 'center',
            verticalPosition: 'top',
        });
    }

    openPersistentSnackBar(message: string, action: string = 'Close') {
        this.snackBar.open(message, action, {
            duration: 0, // Persistent, stays open until user clicks the action button
            horizontalPosition: 'center',
            verticalPosition: 'top',
        });
    }
}
