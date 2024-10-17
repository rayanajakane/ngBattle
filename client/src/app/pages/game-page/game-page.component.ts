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
import { GameJson } from '@app/data-structure/game-structure';
import { Player } from '@app/interfaces/player';
import { HttpClientService } from '@app/services/httpclient.service';
import { MapGameService } from '@app/services/map-game.service';
import { SocketService } from '@app/services/socket.service';
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
    mapSize: number;
    game: GameJson;
    player: Player;
    playersList: Player[];
    gameCreated = false;
    roomId: string;

    httpService = inject(HttpClientService);
    mapService = inject(MapGameService);
    socketService = inject(SocketService);
    constructor(
        private route: ActivatedRoute,
        private router: Router,
    ) {}

    ngOnInit() {
        this.roomId = this.route.snapshot.params['roomId'];
        this.socketService.once('getPlayers', (roomPlayers: Player[]) => {
            this.playersList = roomPlayers;
            roomPlayers.find((player) => {
                if (player.id === this.route.snapshot.params['playerId']) {
                    this.player = player;
                }
            });
        });

        this.socketService.emit('getPlayers', this.roomId);

        this.getGame(this.route.snapshot.params['gameId']).then(() => {
            this.mapService.tiles = this.game.map;
            this.mapSize = parseInt(this.game.mapSize);
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
