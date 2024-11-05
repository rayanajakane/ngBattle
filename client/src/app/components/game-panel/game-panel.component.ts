import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { PlayerCoord } from '@app/pages/game-page/game-page.component';
@Component({
    selector: 'app-game-panel',
    standalone: true,
    imports: [MatCardModule],
    templateUrl: './game-panel.component.html',
    styleUrl: './game-panel.component.scss',
})
export class GamePanelComponent {
    @Input() playerCoords: PlayerCoord[];
    @Input() gameName: string;
    @Input() mapSize: number;
    @Input() activePlayer: string;
    nPlayers: number;

    ngOnChanges() {
        this.nPlayers = this.playerCoords.filter((playerCoord) => !playerCoord.player.abandoned).length;
    }
}
