import { Component, Input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { Player } from '@app/interfaces/player';
import { PlayerCoord } from '@app/pages/game-page/game-page.component';

export interface PlayerBoard {
    role: 'Admin' | 'Joueur';
    playerName: string;
    nWins: number;
}

@Component({
    selector: 'app-leaderboard',
    standalone: true,
    imports: [MatTableModule],
    templateUrl: './leaderboard.component.html',
    styleUrl: './leaderboard.component.scss',
})
export class LeaderboardComponent {
    @Input() playerCoords: PlayerCoord[];
    @Input() activePlayer: Player;
    @Input() turn: number;
    displayedColumns: string[] = ['role', 'playerName', 'nWins'];
    dataSource: Player[];

    ngOnChanges() {
        this.dataSource = this.playerCoords.map((playerCoord) => playerCoord.player);
    }
}
