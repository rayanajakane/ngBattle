import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameStructure } from '@common/game-structure';
import { MapPreviewComponent } from '@app/components/map-preview/map-preview.component';

@Component({
    selector: 'app-game-selection',
    standalone: true,
    imports: [RouterLink, MapPreviewComponent],
    templateUrl: './game-selection.component.html',
    styleUrl: './game-selection.component.scss',
})
export class GameSelectionComponent {
    getMapSize(): number {
        return parseInt(this.game.mapSize, 10);
    }
    @Input() game: GameStructure;
}
