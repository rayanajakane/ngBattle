import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { GameJson } from '@app/data-structure/game-structure';
import { HttpClientService } from '@app/services/httpclient.service';

@Component({
    selector: 'app-admin-item',
    standalone: true,
    imports: [MatCardModule, MatButtonModule],
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
            this.http.deleteGame(this.game.id).subscribe(() => {
                const componentElement = document.querySelector('app-admin-item');
                if (componentElement) {
                    componentElement.remove();
                }
            });
        }
    }
}
