import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
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
import { CurrentMode } from '@app/data-structure/editViewSelectedMode';
import { GameJson } from '@app/data-structure/game-structure';
import { TileTypes } from '@app/data-structure/toolType';
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
    // for drag and drop
    selectedTileType: string = '';
    selectedItem: string = '';
    selectedMode: CurrentMode = CurrentMode.NotSelected;
    game: GameJson;
    mapSize: number = DEFAULT_MAP_SIZE;
    mapService = inject(MapService);
    gameCreated = false;

    // default values for game title and description

    //TODO: Put Router and ActivatedRoute in a single service
    constructor(
        public dialog: MatDialog,
        private httpService: HttpClientService,
        private idService: IDGenerationService,
        private router: Router,
        private route: ActivatedRoute,
        private snackbar: MatSnackBar,
    ) {}

    ngOnInit() {
        this.initEditView(this.route.snapshot.queryParams['gameId']).then(() => this.afterInitEditView());
    }

    afterInitEditView() {
        if (this.game.map.length === 0) {
            this.game.gameType = this.selectGameType(this.route.snapshot.queryParams['gameType']);
            this.game.mapSize = this.selectMapSize(this.route.snapshot.queryParams['mapSize']);
            this.game.map = this.mapService.createGrid(parseInt(this.game.mapSize));
        }
        this.mapSize = parseInt(this.game.mapSize);
        this.gameCreated = true;
    }

    async initEditView(gameId: string) {
        if (!(this.game = await this.httpService.getGame(gameId))) {
            this.game = this.createGameJSON();
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

    resetGame() {
        this.gameCreated = false;
        this.initEditView(this.game.id).then(() => this.afterInitEditView());
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

    changeSelectedTile(tileType: string): void {
        this.selectedItem = '';
        this.selectedTileType = tileType;
        this.selectedMode = CurrentMode.TileTool;
    }

    changeSelectedItem(itemType: string): void {
        this.selectedItem = itemType;
        this.selectedTileType = TileTypes.BASIC;
        this.selectedMode = CurrentMode.ItemTool;
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
