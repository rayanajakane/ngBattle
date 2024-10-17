import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameJson } from '@app/data-structure/game-structure';
import { MapPreviewComponent } from '../map-preview/map-preview.component';

@Component({
    selector: 'app-game-selection',
    standalone: true,
    imports: [RouterLink, MapPreviewComponent],
    templateUrl: './game-selection.component.html',
    styleUrl: './game-selection.component.scss',
})
export class GameSelectionComponent {
    @Input() game: GameJson;

    getMapSize(): number {
        return parseInt(this.game.mapSize, 10);
    }
}
