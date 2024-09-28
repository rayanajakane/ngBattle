import { AfterViewInit, ChangeDetectorRef, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MapComponent } from '@app/components/map/map.component';
import { GameJson } from '@app/data-structure/game-structure';
import { HttpClientService } from '@app/services/httpclient.service';
import { MapService } from '@app/services/map.service';

@Component({
    selector: 'app-admin-item',
    standalone: true,
    imports: [MatCardModule, MatButtonModule, MatTooltipModule, MapComponent],
    templateUrl: './admin-item.component.html',
    styleUrl: './admin-item.component.scss',
})
export class AdminItemComponent implements AfterViewInit {
    @Input() game: GameJson;
    selectedTileType: string = '';
    mapSize: number;
    constructor(
        private http: HttpClientService,
        private mapService: MapService,
        private cdr: ChangeDetectorRef,
    ) {}
    ngAfterViewInit() {
        // timeout prevents ExpressionChangedAfterItHasBeenCheckedError
        // https://stackoverflow.com/questions/71978152/how-can-i-fix-this-specific-ng0100-expressionchangedafterithasbeencheckederror
        setTimeout(() => {
            this.mapSize = parseInt(this.game.mapSize, 10);
        });
        this.cdr.detectChanges(); //? Manually trigger change detection after updating mapSize
        this.mapService.createGrid(this.mapSize, this.game.map);
    }
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
