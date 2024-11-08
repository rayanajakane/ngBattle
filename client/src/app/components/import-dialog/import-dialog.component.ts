import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HttpClientService } from '@app/services/http-client.service';
import { IDGenerationService } from '@app/services/idgeneration.service';
import { GameStructure } from '@common/game-structure';

@Component({
    selector: 'app-import-dialog',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './import-dialog.component.html',
    styleUrl: './import-dialog.component.scss',
})
export class ImportDialogComponent {
    data = inject(MAT_DIALOG_DATA);
    idGenerationService = inject(IDGenerationService);
    dialog = inject(MatDialog);
    input: HTMLInputElement;
    isNameError = false;
    gameName: string;
    game: GameStructure;

    constructor(
        private http: HttpClientService,
        private router: Router,
    ) {}

    loadImportedGame(importedData: Partial<GameStructure>) {
        const game: GameStructure = {
            id: this.idGenerationService.generateID(),
            gameName: importedData.gameName,
            gameDescription: importedData.gameDescription,
            mapSize: importedData.mapSize,
            map: importedData.map,
            gameType: importedData.gameType,
            isVisible: false,
            creationDate: importedData.creationDate,
            lastModified: importedData.lastModified,
        } as GameStructure;

        this.saveGame(game);
    }

    async saveGame(game: GameStructure) {
        this.http.sendGame(game).subscribe({
            next: () => {
                this.dialog.closeAll(); // Handle successful response
                this.router.navigateByUrl('/admin', { skipLocationChange: true }).then(() => {
                    this.router.navigate(['/admin']);
                });
            },
            error: (error: HttpErrorResponse) => {
                const errorp = document.getElementById('errors') as HTMLParagraphElement;
                errorp.textContent = error.error.errors;
                console.log(error.error.errors);
                if (error.error.errors.some((err: string) => err.includes('nom'))) {
                    this.isNameError = true;
                    this.game = game;
                }
            },
        });
    }

    async importGame(event: Event) {
        this.input = event.target as HTMLInputElement;
    }

    readData() {
        if (this.input.files && this.input.files.length > 0) {
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

            reader.readAsText(this.input.files[0]);
        }
    }

    openImportDialog() {
        this.dialog.open(ImportDialogComponent, {
            data: {},
        });
    }

    async onSubmit() {
        if (this.isNameError) {
            const errorp = document.getElementById('errors') as HTMLParagraphElement;
            errorp.textContent = '';
            this.isNameError = false;
            this.game.gameName = this.gameName;
            await this.saveGame(this.game);
        }
    }
}
