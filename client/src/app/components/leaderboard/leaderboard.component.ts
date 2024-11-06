import { Component, Input, OnChanges } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { PlayerCoord } from '@app/pages/game-page/game-page.component';
import { Player } from '@common/player';
@Component({
    selector: 'app-leaderboard',
    standalone: true,
    imports: [MatTableModule],
    templateUrl: './leaderboard.component.html',
    styleUrl: './leaderboard.component.scss',
})
export class LeaderboardComponent implements OnChanges {
    @Input() playerCoords: PlayerCoord[];
    @Input() activePlayer: Player;
    @Input() turn: number;
    @Input() afklist: PlayerCoord[];
    displayedColumns: string[] = ['role', 'playerName', 'nWins'];
    dataSource: Player[];

    ngOnChanges() {
        this.dataSource = this.playerCoords.map((playerCoord) => playerCoord.player);
        if (this.activePlayer) {
            this.dataSource = [this.activePlayer, ...this.dataSource.filter((player) => player !== this.activePlayer)];
        }
    }
}
