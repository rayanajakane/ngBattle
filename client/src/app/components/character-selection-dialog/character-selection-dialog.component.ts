import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-dialog-data-example-dialog',
    templateUrl: './character-selection-dialog.component.html',
    standalone: true,
    imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, RouterLink],
})
export class DialogDataComponent {
    data = inject(MAT_DIALOG_DATA);
}
