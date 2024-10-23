import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MapPreviewComponent } from '@app/components/map-preview/map-preview.component';
import { CombatInterfaceComponent } from '@app/components/combat-interface/combat-interface.component';
import { LeaderboardComponent } from '@app/components/leaderboard/leaderboard.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { PlayerPanelComponent } from '@app/components/player-panel/player-panel.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { TimerComponent } from '@app/components/timer/timer.component';
import { TileJson } from '@app/data-structure/game-structure';
import { GamePanelComponent } from '@app/components/game-panel/game-panel.component';
import { DEFAULT_MAP_SIZE_SMALL } from '@app/services/constants';
@Component({
    selector: 'app-game-page',
    standalone: true,
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
    imports: [
        MatCardModule,
        MatIconModule,
        MatToolbarModule,
        MatListModule,
        MatDividerModule,
        SidebarComponent,
        PlayAreaComponent,
        MapPreviewComponent,
        MatButtonModule,
        MatTabsModule,
        MatGridListModule,
        TimerComponent,
        LeaderboardComponent,
        CombatInterfaceComponent,
        PlayerPanelComponent,
        GamePanelComponent,
    ],
})
export class GamePageComponent implements OnInit {
    mapSize: number = DEFAULT_MAP_SIZE_SMALL;
    gameMap: TileJson[];
    ngOnInit() {
        this.gameMap = Array(this.mapSize * this.mapSize).fill({ tileType: '' });
    }
}
