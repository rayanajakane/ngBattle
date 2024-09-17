import { Component, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface DialogData {
    gameNameInput: string;
    gameDescriptionInput: string;
}

@Component({
    selector: 'app-edit-header-dialog',
    standalone: true,
    imports: [MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose],
    templateUrl: './edit-header-dialog.component.html',
    styleUrl: './edit-header-dialog.component.scss',
})
export class EditHeaderDialogComponent {
    readonly dialogRef = inject(MatDialogRef<EditHeaderDialogComponent>);
    data = inject<DialogData>(MAT_DIALOG_DATA);
    gameNameInput = model(this.data.gameNameInput);
    gameDescriptionInput = model(this.data.gameDescriptionInput);

    onNoClick(): void {
        this.dialogRef.close();
    }
    onYesClick(): void {
        this.gameNameInput.set(this.gameNameInput());
        this.gameDescriptionInput.set(this.gameDescriptionInput());
    }
}
