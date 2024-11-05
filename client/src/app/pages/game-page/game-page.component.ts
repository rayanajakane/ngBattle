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
import { GamePanelComponent } from '@app/components/game-panel/game-panel.component';
import { InventoryComponent } from '@app/components/inventory/inventory.component';
import { LeaderboardComponent } from '@app/components/leaderboard/leaderboard.component';
import { PlayerPanelComponent } from '@app/components/player-panel/player-panel.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { TimerComponent } from '@app/components/timer/timer.component';
import { GameJson, GameTile } from '@app/data-structure/game-structure';
import { Player } from '@app/interfaces/player';
import { HttpClientService } from '@app/services/httpclient.service';
import { MapGameService } from '@app/services/map-game.service';
import { SocketService } from '@app/services/socket.service';
import { Subscription } from 'rxjs';

export interface PlayerCoord {
    player: Player;
    position: number;
}

export interface ShortestPathByTile {
    [key: number]: number[];
}

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
    playerCoords: PlayerCoord[];
    gameCreated = false;
    roomId: string;

    activePlayer: Player;
    turn: number = 0;

    httpService = inject(HttpClientService);
    mapService = inject(MapGameService);
    socketService = inject(SocketService);

    private mapServiceSubscription: Subscription = new Subscription();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
    ) {}

    ngOnInit() {
        this.roomId = this.route.snapshot.params['roomId'];

        this.listenGameSetup();
        this.listenMovement();
        this.listenStartTurn();
        this.listenEndTurn();

        this.socketService.emit('gameSetup', this.roomId);

        this.getGame(this.route.snapshot.params['gameId']).then(() => {
            this.mapService.tiles = this.game.map as GameTile[];
            this.mapSize = parseInt(this.game.mapSize, 10);
            this.gameCreated = true;
            this.startTurn();
        });
    }

    // Need server to send gameSetup to all clients
    listenGameSetup() {
        this.socketService.once('gameSetup', (playerCoords: PlayerCoord[]) => {
            console.log('gameSetup', playerCoords);
            this.initializePlayersPositions(playerCoords);
        });
    }

    listenStartTurn() {
        this.socketService.on('startTurn', (shortestPathByTile: ShortestPathByTile) => {
            this.initializeMovementPrevisualization(shortestPathByTile);
            this.subscribeMapService();
        });
    }

    listenMovement() {
        this.socketService.on('playerPositionUpdate', (data: { playerId: string; newPlayerPosition: number }) => {
            this.updatePlayerPosition(data.playerId, data.newPlayerPosition);
        });
        this.socketService.once('endMove', (shortestPathByTile: ShortestPathByTile) => {
            this.endMovement(shortestPathByTile);
        });
    }

    listenEndTurn() {
        this.socketService.on('endTurn', (turn: number) => {
            this.activePlayer = this.playerCoords[turn].player;
            this.turn = turn;
            this.startTurn();
        });
    }

    initializePlayersPositions(playerCoords: PlayerCoord[]) {
        this.playerCoords = playerCoords;
        this.playerCoords.forEach((playerCoord) => {
            this.mapService.placePlayer(playerCoord.position, playerCoord.player);
        });
        for (const playerCoord of playerCoords) {
            if (playerCoord.player.id === this.route.snapshot.params['playerId']) {
                this.player = playerCoord.player;
                break;
            }
        }
        this.activePlayer = playerCoords[0].player; // the array playerCoords is set in order of player turns
    }

    startTurn() {
        if (this.activePlayer.id === this.player?.id) {
            this.socketService.emit('startTurn', { gameId: this.game.id, playerId: this.activePlayer.id });
        }
    }

    subscribeMapService() {
        this.mapServiceSubscription = this.mapService.event$.subscribe((index) => {
            this.mapService.isMoving = true;
            this.mapService.removeAllPreview();
            this.socketService.emit('move', { gameId: this.game.id, playerId: this.player?.id, newPlayerPosition: index });
        });
    }

    updatePlayerPosition(playerId: string, newPlayerPosition: number) {
        const playerCoord = this.findPlayerCoordById(playerId);
        if (playerCoord) {
            this.mapService.changePlayerPosition(playerCoord.position, newPlayerPosition, playerCoord.player);
            playerCoord.position = newPlayerPosition;
        }
    }

    // Need server to send endMove to only client that moved
    endMovement(shortestPathByTile: ShortestPathByTile) {
        if (Object.keys(shortestPathByTile).length !== 0) {
            this.initializeMovementPrevisualization(shortestPathByTile);
        } else {
            this.resetMovementPrevisualization();
            this.socketService.emit('endTurn');
        }
        this.mapService.isMoving = false;
        this.mapServiceSubscription.unsubscribe();
    }

    findPlayerCoordById(playerId: string): PlayerCoord | undefined {
        return this.playerCoords.find((playerCoord) => playerCoord.player.id === playerId);
    }

    initializeMovementPrevisualization(shortestPathByTile: ShortestPathByTile) {
        this.mapService.setAvailableTiles(Object.keys(shortestPathByTile).map(Number));
        this.mapService.setShortestPathByTile(shortestPathByTile);
        this.mapService.renderAvailableTiles();
    }

    resetMovementPrevisualization() {
        this.mapService.setAvailableTiles([]);
        this.mapService.setShortestPathByTile({});
    }

    async getGame(gameId: string) {
        this.game = await this.httpService.getGame(gameId);
    }

    quitGame() {
        this.router.navigate(['/home']);
    }

    ngOnDestroy() {
        this.mapServiceSubscription.unsubscribe();
    }
}
