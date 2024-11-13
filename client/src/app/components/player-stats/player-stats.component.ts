import { Component, Input } from '@angular/core';
import { Player } from '@common/player';

@Component({
    selector: 'app-player-stats',
    standalone: true,
    imports: [],
    templateUrl: './player-stats.component.html',
    styleUrl: './player-stats.component.scss',
})
export class PlayerStatsComponent {
    @Input() playerList: Player[];
}
