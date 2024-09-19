import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { EditHeaderDialogComponent } from '@app/components/edit-header-dialog/edit-header-dialog.component';
import { MapComponent } from '@app/components/map/map.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { ToolbarComponent } from '@app/components/toolbar/toolbar.component';
import { MapService } from '@app/services/map.service';

@Component({
    selector: 'app-edit-page',
    standalone: true,
    imports: [
        EditHeaderDialogComponent,
        MapComponent,
        ToolbarComponent,
        SidebarComponent,
        MatButtonModule,
        MatIcon,
        MatMenuModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatButtonModule,
    ],
    templateUrl: './edit-page.component.html',
    styleUrl: './edit-page.component.scss',
})
export class EditPageComponent {
    selectedTileType: string = '';

    // default values for game title and description
    gameTitle: string = 'Untitled';
    gameDescription: string = 'Once upon a time...';

    constructor(
        public dialog: MatDialog,
        private mapService: MapService,
    ) {}

    resetGame(): void {
        this.mapService.resetGridToBasic();
        this.gameTitle = 'Untitled';
        this.gameDescription = 'Once upon a time...';
    }
    openDialog(): void {
        const dialogRef = this.dialog.open(EditHeaderDialogComponent, {
            data: { gameNameInput: this.gameTitle, gameDescriptionInput: this.gameDescription },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.gameTitle = result.gameNameInput;
                this.gameDescription = result.gameDescriptionInput;
            }
        });
    }

    tempLog(tileType: string) {
        this.selectedTileType = tileType;
    }
}
