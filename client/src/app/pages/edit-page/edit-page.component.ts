import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EditHeaderDialogComponent } from '@app/components/edit-header-dialog/edit-header-dialog.component';
import { DEFAULT_GAME_TYPE, DEFAULT_MAP_SIZE } from '@app/components/map/constants';
import { MapComponent } from '@app/components/map/map.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { ToolbarComponent } from '@app/components/toolbar/toolbar.component';
import { currentMode } from '@app/data-structure/editViewSelectedMode';
import { GameJson } from '@app/data-structure/game-structure';
import { TileTypes } from '@app/data-structure/toolType';
import { HttpClientService } from '@app/services/httpclient.service';
import { IDGenerationService } from '@app/services/idgeneration.service';

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
    // for drag and drop
    selectedTileType: string = '';
    selectedItem: string = '';
    selectedMode: currentMode = currentMode.NOTSELECTED;
    // game type and map size
    gameType: string;
    mapSize: number;
    gameId: number;

    // default values for game title and description
    gameTitle: string = 'Untitled';
    gameDescription: string = 'Once upon a time...';

    //TODO: Put Router and ActivatedRoute in a single service
    @ViewChild(MapComponent) map: MapComponent;
    constructor(
        public dialog: MatDialog,
        private httpService: HttpClientService,
        private idService: IDGenerationService,
        private router: Router,
        private route: ActivatedRoute,
        private snackbar: MatSnackBar,
    ) {}

    ngOnInit() {
        // verify if the game is imported or not
        this.route.queryParams.subscribe((params) => {
            this.gameType = params['gameType'] == 'classic' ? 'classic' : DEFAULT_GAME_TYPE;
            this.mapSize = params['mapSize'] == 'medium' ? 15 : params['mapSize'] == 'large' ? 20 : DEFAULT_MAP_SIZE;
        });
    }

    // selectGameType(gameType: string): string {
    //     return gameType == 'classic' ? 'classic' : DEFAULT_GAME_TYPE;
    // }

    // selectMapSize(mapSize: string): number {
    //     if (mapSize == 'medium') {
    //         return 15;
    //     }
    //     if (mapSize == 'large') {
    //         return 20;
    //     }
    //     return DEFAULT_MAP_SIZE;
    // }

    resetGame(): void {
        this.map.resetGridToBasic();
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

    changeSelectedTile(tileType: string): void {
        this.selectedItem = '';
        this.selectedTileType = tileType;
        this.selectedMode = currentMode.TILETOOL;
    }

    changeSelectedItem(itemType: string): void {
        this.selectedItem = itemType;
        this.selectedTileType = TileTypes.BASIC;
        this.selectedMode = currentMode.ITEMTOOL;
    }

    createGameJSON(): GameJson {
        return {
            id: this.gameId ? this.gameId : this.idService.generateID(),
            gameName: this.gameTitle,
            gameDescription: this.gameDescription,
            mapSize: this.mapSize.toString(),
            map: this.map.tiles,
            gameType: 'CTF',
            isVisible: true,
            creationDate: '',
            lastModified: '',
        } as GameJson;
    }

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
            errorMessage = error.error.errors.join(', ');
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
}
