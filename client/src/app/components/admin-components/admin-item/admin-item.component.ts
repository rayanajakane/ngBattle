import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GameJson } from '@app/data-structure/game-structure';
import { HttpClientService } from '@app/services/httpclient.service';

@Component({
    selector: 'app-admin-item',
    standalone: true,
    imports: [MatCardModule, MatButtonModule, MatTooltipModule],
    templateUrl: './admin-item.component.html',
    styleUrl: './admin-item.component.scss',
})
export class AdminItemComponent {
    @Input() game: GameJson;
    constructor(private http: HttpClientService) {}

    invertVisibility() {
        this.http.changeVisibility(this.game.id).subscribe(() => {
            this.game.isVisible = !this.game.isVisible;
        });
    }

    deleteGame() {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce jeu?')) {
            this.http.getGame(this.game.id).subscribe((game) => {
                if (!game) {
                    alert('Le jeu a déjà été supprimé par un autre administrateur');
                    return;
                } else {
                    this.http.deleteGame(this.game.id).subscribe(() => {
                        alert('Le jeu a été supprimé avec succès');
                    });
                }
            });
            const componentElement = document.querySelector('app-admin-item');
            if (componentElement) {
                componentElement.remove();
            }
        }
    }
}
