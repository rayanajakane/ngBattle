import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-dialog-data-example-dialog',
    template: `<mat-dialog-content>
        <h1 mat-dialog-title>Note</h1>
        @for (error of data.foundErrors; track $index) {
        <p>{{ error }}</p>
        }
        <mat-dialog-actions>
            @if (data.navigateGameSelection) {
            <button mat-button mat-dialog-close [routerLink]="['/gameSelection']">Close</button>
            } @else {
            <button mat-button mat-dialog-close>Close</button>
            }
        </mat-dialog-actions>
    </mat-dialog-content>`,
    standalone: true,
    imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, RouterLink],
})
export class DialogDataComponent {
    data = inject(MAT_DIALOG_DATA);
}
