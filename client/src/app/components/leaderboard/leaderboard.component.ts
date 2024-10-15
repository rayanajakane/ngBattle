import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';

export interface PlayerBoard {
    position: number;
    playerName: string;
    nWins: number;
}

const ELEMENT_DATA: PlayerBoard[] = [
    { position: 1, playerName: 'Ali', nWins: 0 },
    { position: 2, playerName: 'Anis', nWins: 1 },
    { position: 3, playerName: 'Rayan', nWins: 2 },
    { position: 4, playerName: 'Samyar', nWins: 3 },
    { position: 5, playerName: 'Yanis', nWins: 4 },
    { position: 6, playerName: 'Zack', nWins: 5 },
];

@Component({
    selector: 'app-leaderboard',
    standalone: true,
    imports: [MatTableModule],
    templateUrl: './leaderboard.component.html',
    styleUrl: './leaderboard.component.scss',
})
export class LeaderboardComponent {
    displayedColumns: string[] = ['position', 'playerName', 'nWins'];
    dataSource = ELEMENT_DATA;
}
