import { NgFor } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AttributeSelectionComponent } from '@app/components/attribute-selection/attribute-selection.component';
import { AvatarSliderComponent } from '@app/components/avatar-slider/avatar-slider.component';
import { NavigateDialogComponent } from '@app/components/navigate-dialog/navigate-dialog.component';
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

    formChecking(): string[] {
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
            this.dialog.open(NavigateDialogComponent, {
                data: {
                    foundErrors: ["La partie n'existe pas -> VOUS SEREZ REDIRIGÉ VERS LA PAGE DE SÉLECTION DE PARTIE"],
                    navigateGameSelection: true,
                },
            });
        } else if (errors.length > 0) {
            this.dialog.open(NavigateDialogComponent, {
                data: {
                    foundErrors: errors,
                    navigateGameSelection: false,
                },
            });
        } else {
            // TODO: Envoi des données
            let navData;
            this.socketService.connect();
            this.socketService.once('roomJoined', (data: { roomId: string; playerId: string }) => {
                navData = {
                    roomId: data.roomId,
                    playerId: data.playerId,
                    characterName: this.characterName,
                    selectedAvatar: this.selectedAvatar?.name,
                    isAdmin: true,
                };
                this.router.navigate(['/waitingRoom', navData]);
            });
            this.socketService.emit('createRoom', {
                gameId: this.route.snapshot.params.id,
                playerName: this.characterName,
                avatar: this.selectedAvatar?.name,
            });
        }
    }
}
