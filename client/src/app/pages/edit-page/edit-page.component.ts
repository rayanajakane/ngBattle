import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
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
export class EditPageComponent implements OnInit {
    selectedTileType: string = '';
    gameType: string;
    mapSize: number;
    gameId: number;

    // default values for game title and description
    gameTitle: string = 'Untitled';
    gameDescription: string = 'Once upon a time...';

    constructor(
        private dialog: MatDialog,
        private mapService: MapService,
        private httpService: HttpClientService,
        private idService: IDGenerationService,
        private router: Router,
        private snackbar: MatSnackBar,
    ) {}

    ngOnInit() {
        // verify if the game is imported or not
        this.gameType = this.mapService.gameType;
        this.mapSize = this.mapService.mapSize || DEFAULT_MAP_SIZE;
    }

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

    changeSelectedTile(tileType: string) {
        this.selectedTileType = tileType;
    }

    createGameJSON() {
        return {
            id: this.gameId ? this.gameId : this.idService.generateID(),
            gameName: this.gameTitle,
            gameDescription: this.gameDescription,
            mapSize: this.mapSize.toString(),
            map: this.mapService.tiles,
            gameType: 'CTF',
            isVisible: true,
            creationDate: '',
            lastModified: '',
        } as GameJson;
    }

    // TODO: Add feature to save game conditionnally if game exists
    saveGame() {
        const game = this.createGameJSON();
        if (this.httpService.gameExists(game.id)) {
            // Update game if it already exists
            this.httpService.updateGame(game).subscribe({
                next: () => {
                    this.router.navigate(['/admin']);
                },
                error: (error: HttpErrorResponse) => {
                    this.handleError(error);
                },
            });
        } else {
            // Send game if it doesn't exist yet
            this.httpService.sendGame(game).subscribe({
                next: () => {
                    this.router.navigate(['/admin']);
                },
                error: (error: HttpErrorResponse) => {
                    this.handleError(error);
                },
            });
        }
    }
    private handleError(error: HttpErrorResponse) {
        let errorMessage = 'An unexpected error occurred';

        // Extract the error message from 'errors' array or 'message' property
        if (error.error.errors && error.error.errors.length > 0) {
            errorMessage = error.error.errors.join(',');
        } else if (error.error.message) {
            errorMessage = error.error.message;
        }

        // Display error in a snackbar
        this.snackbar.open(errorMessage, 'Fermer', {
            duration: undefined,
            verticalPosition: 'top',
            horizontalPosition: 'center',
        });
    }
    // ngOnInit(): void {
    //     // TODO : update the redirection to create page with new method
    //     if (performance.navigation.type === 1) {
    //         this.router.navigate(['/create']);
    //       }
    // }
}
