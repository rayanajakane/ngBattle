import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';

export interface PlayerBoard {
    role: 'Admin' | 'Joueur';
    playerName: string;
    nWins: number;
}

const ELEMENT_DATA: PlayerBoard[] = [
    { role: 'Admin', playerName: 'Ali', nWins: 0 },
    { role: 'Joueur', playerName: 'Anis', nWins: 1 },
    { role: 'Joueur', playerName: 'Rayan', nWins: 2 },
    { role: 'Joueur', playerName: 'Samyar', nWins: 3 },
    { role: 'Joueur', playerName: 'Yanis', nWins: 4 },
    { role: 'Joueur', playerName: 'Zack', nWins: 5 },
];

@Component({
    selector: 'app-leaderboard',
    standalone: true,
    imports: [MatTableModule],
    templateUrl: './leaderboard.component.html',
    styleUrl: './leaderboard.component.scss',
})
export class LeaderboardComponent {
    displayedColumns: string[] = ['role', 'playerName', 'nWins'];
    dataSource = ELEMENT_DATA;
}
