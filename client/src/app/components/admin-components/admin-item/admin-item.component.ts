import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { GameJson, HttpclientService } from '@app/services/httpclient.service';

@Component({
    selector: 'app-admin-item',
    standalone: true,
    imports: [MatCardModule, MatButtonModule],
    templateUrl: './admin-item.component.html',
    styleUrl: './admin-item.component.scss',
})
export class AdminItemComponent {
    constructor(private http: HttpclientService) {}

    @Input() game: GameJson;

    invertVisibility() {
        this.http.changeVisibility(this.game.id).subscribe(() => {
            window.location.reload();
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
