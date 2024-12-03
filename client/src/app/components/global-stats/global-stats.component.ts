import { Component, Input } from '@angular/core';
import { GlobalStats } from '@common/global-stats';

@Component({
    selector: 'app-global-stats',
    standalone: true,
    imports: [],
    templateUrl: './global-stats.component.html',
    styleUrl: './global-stats.component.scss',
})
export class GlobalStatsComponent {
    @Input() globalStats: GlobalStats;
    //globalStats: GlobalStats = { matchLength: 0, nbTurns: 0, visitedTilesPercent: 0, usedDoorsPercent: 0, nbPlayersHeldFlag: 0 };

    @Input() gameMode: string;

    formatMatchLength(length: number): string {
        const minutes = Math.floor(length / 60);

        const seconds = (length % 60).toString().padStart(2, '0');

        return `${minutes}:${seconds}`;
    }

    formatVisitedTilesPercent(visitedTilesPercent: number): string {
        return `${visitedTilesPercent.toFixed(2)}%`;
    }
}
