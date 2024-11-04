import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-game-panel',
    standalone: true,
    imports: [MatCardModule],
    templateUrl: './game-panel.component.html',
    styleUrl: './game-panel.component.scss',
})
export class GamePanelComponent {
    @Input() gameName: string;
    @Input() mapSize: number;
    @Input() nPlayers: number;
    @Input() activePlayer: string;
}
