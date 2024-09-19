import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterLink } from '@angular/router';
import { EditHeaderDialogComponent } from '@app/components/edit-header-dialog/edit-header-dialog.component';
import { DEFAULT_MAP_SIZE } from '@app/components/map/constants';
import { MapComponent } from '@app/components/map/map.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { ToolbarComponent } from '@app/components/toolbar/toolbar.component';
import { GameJson } from '@app/data-structure/game-structure';
import { HttpClientService } from '@app/services/httpclient.service';
import { IDGenerationService } from '@app/services/idgeneration.service';
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
        RouterLink,
    ],
    templateUrl: './edit-page.component.html',
    styleUrl: './edit-page.component.scss',
})
export class EditPageComponent {
    selectedTileType: string = '';
    mapSize: number = DEFAULT_MAP_SIZE;

    // default values for game title and description
    gameTitle: string = 'Untitled';
    gameDescription: string = 'Once upon a time...';

    constructor(
        public dialog: MatDialog,
        private mapService: MapService,
        private httpService: HttpClientService,
        private idService: IDGenerationService,
        private router: Router,
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

    createGameJSON() {
        return {
            id: this.idService.generateID(),
            gameName: this.gameTitle,
            gameDescription: this.gameDescription,
            mapSize: this.mapSize.toString(),
            map: this.mapService.tiles,
            gameType: 'CTF',
            isVisible: true,
            creationDate: '',
        } as GameJson;
    }

    // TODO: Add feature to save game conditionnally if game exists
    saveGame() {
        this.httpService.sendGame(this.createGameJSON()).subscribe(() => {
            this.router.navigate(['/admin']);
        });
    }
}
