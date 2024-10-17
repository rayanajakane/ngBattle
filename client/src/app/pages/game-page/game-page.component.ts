import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { CombatInterfaceComponent } from '@app/components/combat-interface/combat-interface.component';
import { GameMapComponent } from '@app/components/game-map/game-map.component';
import { InventoryComponent } from '@app/components/inventory/inventory.component';
import { LeaderboardComponent } from '@app/components/leaderboard/leaderboard.component';
import { PlayerPanelComponent } from '@app/components/player-panel/player-panel.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { TimerComponent } from '@app/components/timer/timer.component';
import { TileJson } from '@app/data-structure/game-structure';
import { PlayerAttribute } from '@app/interfaces/player';
import { HttpClientService } from '@app/services/httpclient.service';
import { MapGameService } from '@app/services/map-game.service';
import { PlayerService } from '@app/services/player.service';
import { GamePanelComponent } from '../../components/game-panel/game-panel.component';

@Component({
    selector: 'app-game-page',
    standalone: true,
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
    imports: [
        ChatComponent,
        InventoryComponent,
        MatCardModule,
        MatIconModule,
        MatListModule,
        SidebarComponent,
        GameMapComponent,
        MatButtonModule,
        MatTabsModule,
        TimerComponent,
        LeaderboardComponent,
        CombatInterfaceComponent,
        PlayerPanelComponent,
        GamePanelComponent,
    ],
})
export class GamePageComponent implements OnInit {
    mapSize: number = 10;
    gameMap: TileJson[];
    roomId: string;
    playerId: string;
    characterName: string;
    selectedAvatar: string;
    isAdmin: boolean;
    attributes: PlayerAttribute;
    game: any;
    httpService = inject(HttpClientService);
    mapService = inject(MapGameService);
    gameCreated = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private playerService: PlayerService,
    ) {}

    ngOnInit() {
        this.roomId = this.playerService.getRoomId();
        this.characterName = this.playerService.getCharacterName();
        this.selectedAvatar = this.playerService.getSelectedAvatar();
        this.attributes = this.playerService.getAttributes();
        console.log(this.attributes);
        this.getGame(this.route.snapshot.params['gameId']).then(() => {
            this.mapService.tiles = this.game.map;
            this.gameCreated = true;
        });
    }

    async getGame(gameId: string) {
        this.game = await this.httpService.getGame(gameId);
    }

    quitGame() {
        this.router.navigate(['/home']);
    }
}
