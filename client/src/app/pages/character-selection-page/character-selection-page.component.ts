import { NgFor } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AttributeSelectionComponent } from '@app/components/attribute-selection/attribute-selection.component';
import { AvatarSliderComponent } from '@app/components/avatar-slider/avatar-slider.component';
import { HttpClientService } from '@app/services/httpclient.service';
import { SocketService } from '@app/services/socket.service';

@Component({
    selector: 'app-character-selection-page',
    standalone: true,
    imports: [NgFor, FormsModule, MatButtonModule, MatTooltipModule, RouterLink, AttributeSelectionComponent, AvatarSliderComponent],
    templateUrl: './character-selection-page.component.html',
    styleUrl: './character-selection-page.component.scss',
})
export class CharacterSelectionPageComponent {
    dialog = inject(MatDialog);

    selectedAvatar: { name: string; img: string } | null = null;
    characterName: string = '';
    private readonly minNameLength: number = 3;
    private readonly maxNameLength: number = 15;

    // Initialisation dans le constructeur
    constructor(
        private router: Router,
        private http: HttpClientService,
        private route: ActivatedRoute,
        private socketService: SocketService,
    ) {}

    receiveSelectedAvatar(selectedAvatarFromChild: { name: string; img: string }) {
        this.selectedAvatar = selectedAvatarFromChild;
    }

    // Méthodes publiques

    async formChecking(): Promise<string[]> {
        const errors: string[] = [];
        // Vérification des erreurs
        if (!this.selectedAvatar) errors.push('- Veuillez sélectionner un avatar avant de continuer');
        if (!this.isNameValid()) errors.push('- Veuillez mettre un nom pour le personne entre 3 et 15 charactères');

        return errors;
    }

    async isGameValidToCreate(): Promise<boolean> {
        return (await this.http.getGame(this.route.snapshot.params.id)) !== null;
    }

    isNameValid(): boolean {
        return this.characterName.length >= this.minNameLength && this.characterName.length <= this.maxNameLength;
    }

    async onSubmit(event: Event) {
        event.preventDefault();

        const errors = await this.formChecking();

        if (!(await this.isGameValidToCreate())) {
            this.dialog.open(DialogDataComponent, {
                data: {
                    foundErrors: ["La partie n'existe pas -> VOUS SEREZ REDIRIGÉ VERS LA PAGE DE SÉLECTION DE PARTIE"],
                    navigateGameSelection: true,
                },
            });
        } else if (errors.length > 0) {
            this.dialog.open(DialogDataComponent, {
                data: {
                    foundErrors: errors,
                    navigateGameSelection: false,
                },
            });
        } else {
            // TODO: Envoi des données
            this.socketService.connect();
            // if (!this.joinMatchService.isSocketAlive()) {
            //     this.dialog.open(DialogDataComponent, {
            //         data: {
            //             foundErrors: ['Erreur de connexion au serveur'],
            //             navigateGameSelection: false,
            //         },
            //     });
            //     return;
            // }
            this.socketService.emit('createRoom', {
                gameId: this.route.snapshot.params.id,
                playerName: this.characterName,
                avatar: this.selectedAvatar?.name,
            });
            this.router.navigate(['/waitingRoom']);
        }
    }
}

@Component({
    selector: 'app-dialog-data-example-dialog',
    template: `<mat-dialog-content>
        <h1 mat-dialog-title>Note</h1>
        @for (error of data.foundErrors; track $index) {
        <p>{{ error }}</p>
        }
        <mat-dialog-actions>
            @if (data.navigateGameSelection) {
            <button mat-button mat-dialog-close [routerLink]="['/gameSelection']">Close</button>
            } @else {
            <button mat-button mat-dialog-close>Close</button>
            }
        </mat-dialog-actions>
    </mat-dialog-content>`,
    standalone: true,
    imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, RouterLink],
})
export class DialogDataComponent {
    data = inject(MAT_DIALOG_DATA);
}
