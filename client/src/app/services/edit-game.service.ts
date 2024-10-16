import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { DEFAULT_GAME_TYPE, DEFAULT_MAP_SIZE } from '@app/components/constants';
import { GameJson } from '@app/data-structure/game-structure';
import { DragDropService } from './drag-drop.service';
import { HttpClientService } from './httpclient.service';
import { IDGenerationService } from './idgeneration.service';
import { MapEditService } from './map-edit.service';

@Injectable({
    providedIn: 'root',
})
export class EditGameService {
    game: GameJson;
    mapSize: number;
    placedStartingPoints: number = 0;
    placedRandomItems: number = 0;
    gameCreated = false;

    idService = inject(IDGenerationService);
    httpService = inject(HttpClientService);
    mapEditService = inject(MapEditService);
    dragDropService = inject(DragDropService);

    // TODO: Put Router and ActivatedRoute in a single service
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private snackbar: MatSnackBar,
    ) {}

    initializeEditPage() {
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

    async setGame(gameId: string) {
        if (!(this.game = await this.httpService.getGame(gameId))) {
            this.game = this.createGameJSON();
        }
    }

    configureGame() {
        if (this.game.map.length === 0) {
            this.game.gameType = this.selectGameType(this.route.snapshot.queryParams['gameType']);
            this.game.mapSize = this.selectMapSize(this.route.snapshot.queryParams['mapSize']);
            this.game.map = this.mapEditService.createGrid(parseInt(this.game.mapSize, 10));
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

    getGameDetails() {
        return {
            gameNameInput: this.game.gameName,
            gameDescriptionInput: this.game.gameDescription,
        };
    }

    setGameDetails(gameName: string, gameDescription: string) {
        this.game.gameName = gameName;
        this.game.gameDescription = gameDescription;
    }
}
