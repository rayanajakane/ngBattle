import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameJson } from '@app/data-structure/game-structure';

@Component({
    selector: 'app-game-selection',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './game-selection.component.html',
    styleUrl: './game-selection.component.scss',
})
export class GameSelectionComponent {
    @Input() game: GameJson;
}
