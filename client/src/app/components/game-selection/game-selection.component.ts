import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameStructure } from '@common/game-structure';

@Component({
    selector: 'app-game-selection',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './game-selection.component.html',
    styleUrl: './game-selection.component.scss',
})
export class GameSelectionComponent {
    @Input() game: GameStructure;
}
