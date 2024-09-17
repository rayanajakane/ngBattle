import { ChangeDetectionStrategy, Component, inject, model, signal } from '@angular/core';
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
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './edit-page.component.html',
    styleUrl: './edit-page.component.scss',
})
export class EditPageComponent {
    gameTitle: string;
    gameDescription: string;
    selectedTileType: string = '';
    readonly animal = signal('');
    readonly name = model('');
    readonly dialog = inject(MatDialog);
    constructor() {
        this.gameTitle = '[ Game Title ]';
        this.gameDescription = '[ Game Description ]';
    }
    // TODO: adapt this to the right dialog
    openDialog(): void {
        const dialogRef = this.dialog.open(EditHeaderDialogComponent, {
            data: { name: this.name(), animal: this.animal() },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result !== undefined) {
                this.animal.set(result);
            }
        });
    }
    changeHeader(title: string, description: string) {
        this.gameTitle = title;
        this.gameDescription = description;
    }

    tempLog(tileType: string) {
        this.selectedTileType = tileType;
    }
}
