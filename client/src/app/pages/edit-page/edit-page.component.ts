import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DEFAULT_GAME_TYPE, DEFAULT_MAP_SIZE } from '@app/components/constants';
import { EditHeaderDialogComponent } from '@app/components/edit-header-dialog/edit-header-dialog.component';
import { EditMapComponent } from '@app/components/edit-map/edit-map.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { ToolbarComponent } from '@app/components/toolbar/toolbar.component';
import { CurrentMode } from '@app/data-structure/editViewSelectedMode';
import { GameJson } from '@app/data-structure/game-structure';
import { TileTypes } from '@app/data-structure/toolType';
import { DragDropService } from '@app/services/drag-drop.service';
import { HttpClientService } from '@app/services/httpclient.service';
import { IDGenerationService } from '@app/services/idgeneration.service';
import { MapEditService } from '@app/services/map-edit.service';
import { MapService } from '@app/services/map.service';
@Component({
    selector: 'app-edit-page',
    standalone: true,
    imports: [
        EditHeaderDialogComponent,
        EditMapComponent,
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
    game: GameJson;
    mapSize: number;
    mapService = inject(MapService);
    idService = inject(IDGenerationService);
    dragDropService = inject(DragDropService);
    mapEditService = inject(MapEditService);
    placedStartingPoints: number = 0;
    placedRandomItems: number = 0;

    gameCreated = false;

    // TODO: Put Router and ActivatedRoute in a single service
    constructor(
        public dialog: MatDialog,
        private httpService: HttpClientService,
        private router: Router,
        private route: ActivatedRoute,
        private snackbar: MatSnackBar,
    ) {}

    ngOnInit() {
        this.setGame(this.route.snapshot.queryParams['gameId']).then(() => {
            this.configureGame();

            this.countPlacedStartingPoints();
            this.countPlacedRandomItems();

            this.dragDropService.setMultipleItemCounter(parseInt(this.game.mapSize, 10), this.placedStartingPoints, this.placedRandomItems);
        });
    }

    countPlacedStartingPoints() {
        this.placedStartingPoints = this.game.map.reduce((acc, tile) => {
            return tile.item === 'startingPoint' ? acc + 1 : acc;
        }, 0);
    }

    countPlacedRandomItems() {
        this.placedRandomItems = this.game.map.reduce((acc, tile) => {
            return tile.item === 'item-aleatoire' ? acc + 1 : acc;
        }, 0);
    }

    async setGame(gameId: string) {
        if (!(this.game = await this.httpService.getGame(gameId))) {
            this.game = this.createGameJSON();
        }
    }

    configureGame() {
        if (this.game.map.length === 0) {
            this.game.gameType = this.selectGameType(this.route.snapshot.queryParams['gameType']);
            this.game.mapSize = this.selectMapSize(this.route.snapshot.queryParams['mapSize']);
            this.game.map = this.mapService.createGrid(parseInt(this.game.mapSize, 10));
        }
        this.mapSize = parseInt(this.game.mapSize, 10);
        this.mapEditService.tiles = this.game.map; // Find better way to update service tiles
        this.gameCreated = true;
    }

    selectGameType(gameType: string): string {
        return gameType === 'classic' ? 'classic' : DEFAULT_GAME_TYPE;
    }

    selectMapSize(mapSize: string): string {
        if (mapSize === 'medium') {
            return '15';
        }
        if (mapSize === 'large') {
            return '20';
        }
        return DEFAULT_MAP_SIZE.toString();
    }

    resetGame() {
        this.gameCreated = false;
        this.setGame(this.game.id).then(() => this.configureGame());
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

    // TODO: Place into MapEditService
    changeSelectedTile(tileType: string): void {
        this.mapEditService.selectedItem = '';
        this.mapEditService.selectedTileType = tileType;
        this.mapEditService.selectedMode = CurrentMode.TileTool;
    }

    // TODO: Place into MapEditService
    changeSelectedItem(itemType: string): void {
        this.mapEditService.selectedItem = itemType;
        this.mapEditService.selectedTileType = TileTypes.BASIC;
        this.mapEditService.selectedMode = CurrentMode.ItemTool;
    }

    createGameJSON(): GameJson {
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
        if (await this.httpService.gameExists(this.game.id)) {
            // Update game if it already exists
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

    private handleError(httpError: HttpErrorResponse) {
        let errorMessage = 'An unexpected error occurred';

        // Extract the error message from 'errors' array or 'message' property
        if (httpError.error.errors && httpError.error.errors.length > 0) {
            errorMessage = httpError.error.errors.join(', ');
        } else if (httpError.error.message) {
            errorMessage = httpError.error.message;
        }

        // Display error in a snackbar
        this.snackbar.open(errorMessage, 'Fermer', {
            duration: undefined,
            verticalPosition: 'top',
            horizontalPosition: 'center',
        });
    }
}
