import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AdminItemComponent } from '@app/components/admin-item/admin-item.component';
import { EditGameService } from '@app/services/edit-game.service';
import { HttpClientService } from '@app/services/http-client.service';
import { GameStructure } from '@common/game-structure';

@Component({
    selector: 'app-admin-page',
    standalone: true,
    imports: [AdminItemComponent, RouterLink, RouterOutlet, MatButtonModule, MatGridListModule, MatCardModule],
    templateUrl: './admin-page.component.html',
    styleUrl: './admin-page.component.scss',
})
export class AdminPageComponent implements OnInit {
    games: GameStructure[];
    editGameService = inject(EditGameService);

    constructor(
        private http: HttpClientService,
        private router: Router,
    ) {}

    async ngOnInit() {
        this.games = await this.http.getAllGames();
    }

    loadGames() {
        this.http.getAllGames().then((data: GameStructure[]) => {
            this.games = data;
        });
    }

    editGame(gameId: string) {
        this.router.navigate(['/edit'], { queryParams: { gameId } });
    }

    exportGame(game: GameStructure) {
        const { isVisible, ...gameWithoutVisibility } = game;

        const jsonData = JSON.stringify(gameWithoutVisibility, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });

        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${gameWithoutVisibility.gameName}.json`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
    }

    loadImportedGame(importedData: Partial<GameStructure>) {
        const game: GameStructure = {
            id: importedData.id,
            gameName: importedData.gameName,
            gameDescription: importedData.gameDescription,
            mapSize: importedData.mapSize,
            map: importedData.map,
            gameType: importedData.gameType,
            isVisible: false,
            creationDate: importedData.creationDate,
            lastModified: importedData.lastModified,
        } as GameStructure;

        this.editGameService.game = game;
        console.log('Game:', this.editGameService.game);

        this.editGameService.saveGame();
        this.loadGames();
    }

    async importGame(event: Event) {
        const input = event.target as HTMLInputElement;

        if (input.files && input.files.length > 0) {
            const reader = new FileReader();
            let importedData: Partial<GameStructure> = {};

            reader.onload = () => {
                try {
                    importedData = JSON.parse(reader.result as string);
                    console.log('Imported Data:', importedData);

                    this.loadImportedGame(importedData);
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                }
            };

            reader.onerror = (error) => {
                console.error('Error reading file:', error);
            };

            reader.readAsText(input.files[0]);
        }
    }
}
