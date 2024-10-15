import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-game-panel',
    standalone: true,
    imports: [MatCardModule],
    templateUrl: './game-panel.component.html',
    styleUrl: './game-panel.component.scss',
})
export class GamePanelComponent {
    mapSize: number;
    nPlayers: number;
    activePlayer: string;
}
