import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { GlobalStatsComponent } from '@app/components/global-stats/global-stats.component';
import { PlayerStatsComponent } from '@app/components/player-stats/player-stats.component';
import { GlobalStats } from '@common/global-stats';
import { Player } from '@common/player';

@Component({
    selector: 'app-game-end-page',
    standalone: true,
    imports: [ChatComponent, PlayerStatsComponent, GlobalStatsComponent],
    templateUrl: './game-end-page.component.html',
    styleUrl: './game-end-page.component.scss',
})
export class GameEndPageComponent implements OnInit {
    roomId: string;
    characterName: string;
    playerList: Player[];
    globalStats: GlobalStats;
    gameMode: string;

    constructor(private readonly route: ActivatedRoute) {}

    ngOnInit() {
        this.route.params.subscribe((params) => {
            this.roomId = params.roomId;
            this.characterName = params.characterName;
        });
    }
}
