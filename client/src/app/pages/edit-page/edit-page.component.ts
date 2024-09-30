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
    selectedTileType: string = '';
    selectedItem: string = '';

    game: GameJson;
    mapSize: number = DEFAULT_MAP_SIZE;

    selectedMode: currentMode = currentMode.NOTSELECTED;

    // default values for game title and description

    //TODO: Put Router and ActivatedRoute in a single service
    @ViewChild(MapComponent) mapGrid: MapComponent;
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
        this.initEditView();
    }

    ngAfterViewInit() {
        this.afterInitEditView();
    }

    initEditView() {
        this.route.queryParams.subscribe(async (params) => {
            let gameId: string = params['gameId'];
            // TODO: check if game exist
            if (gameId && (await this.httpService.gameExists(gameId))) {
                setTimeout(() => {
                    this.httpService
                        .getGame(gameId)
                        .then((game: GameJson) => {
                            this.game = game;
                        })
                        .catch((error) => {
                            this.handleError(error);
                        });
                }, 0);
            } else {
                this.game = this.createGameJSON();
                this.game.gameType = this.selectGameType(params['gameType']);
                this.game.mapSize = this.selectMapSize(params['mapSize']);
            }
            this.mapSize = parseInt(this.game.mapSize);
        });
    }

    afterInitEditView() {
        if (this.game.map.length !== 0) {
            this.mapGrid.tiles = this.game.map;
        }
    }

    selectGameType(gameType: string): string {
        return gameType == 'classic' ? 'classic' : DEFAULT_GAME_TYPE;
    }

    selectMapSize(mapSize: string): string {
        if (mapSize == 'medium') {
            return '15';
        }
        if (mapSize == 'large') {
            return '20';
        }
        return DEFAULT_MAP_SIZE.toString();
    }

    resetGame(): void {
        this.initEditView();
        this.afterInitEditView();
    }

    openDialog(): void {
        const dialogRef = this.dialog.open(EditHeaderDialogComponent, {
            data: { gameNameInput: this.game.gameName, gameDescriptionInput: this.game.gameDescription },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.game.gameName = result.gameNameInput;
                this.game.gameDescription = result.gameDescriptionInput;
            }
        });
    }

    changeSelectedTile(tileType: string) {
        this.selectedTileType = tileType;
        this.selectedItem = '';
        this.selectedMode = currentMode.TILETOOL;
    }

    changeSelectedItem(itemType: string) {
        this.selectedItem = itemType;
        this.selectedTileType = TileTypes.BASIC;
        this.selectedMode = currentMode.ITEMTOOL;
    }

    createGameJSON() {
        return {
            id: this.idService.generateID(),
            gameName: 'Sans titre',
            gameDescription: 'Il était une fois...',
            mapSize: '10',
            map: [],
            gameType: '',
            isVisible: true,
            creationDate: '',
            lastModified: '',
        } as GameJson;
    }

    async saveGame() {
        this.game.map = this.mapGrid.tiles;
        if (await this.httpService.gameExists(this.game.id)) {
            // Update game if it already exists
            console.log('im here');
            this.httpService.updateGame(this.game).subscribe({
                next: () => {
                    this.router.navigate(['/admin']);
                },
                error: (error: HttpErrorResponse) => {
                    this.handleError(error);
                },
            });
        } else {
            // Send game if it doesn't exist yet
            this.httpService.sendGame(this.game).subscribe({
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
