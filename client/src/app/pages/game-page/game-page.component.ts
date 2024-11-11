import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { Combat } from '@app/classes/combat';
import { ChatComponent } from '@app/components/chat/chat.component';
import { CombatInterfaceComponent } from '@app/components/combat-interface/combat-interface.component';
import { GameMapComponent } from '@app/components/game-map/game-map.component';
import { GamePanelComponent } from '@app/components/game-panel/game-panel.component';
import { InventoryComponent } from '@app/components/inventory/inventory.component';
import { LeaderboardComponent } from '@app/components/leaderboard/leaderboard.component';
import { LogsComponent } from '@app/components/logs/logs.component';
import { PlayerPanelComponent } from '@app/components/player-panel/player-panel.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { TimerComponent } from '@app/components/timer/timer.component';
import { GameControllerService } from '@app/services/game-controller.service';
import { HttpClientService } from '@app/services/http-client.service';
import { MapGameService } from '@app/services/map-game.service';
import { SocketService } from '@app/services/socket.service';
import { GameStructure, GameTile } from '@common/game-structure';
import { Player, PlayerCoord } from '@common/player';
import { Subscription } from 'rxjs';

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
        LogsComponent,
    ],
})
export class GamePageComponent implements OnInit, OnDestroy {
    mapSize: number;
    game: GameStructure;
    player: Player;
    playersList: Player[];
    playerCoords: PlayerCoord[];

    currentMoveBudget: number;

    gameCreated = false;
    playersInitialized = false;

    roomId: string;

    activePlayer: Player;
    turn: number = 0;

    afklist: PlayerCoord[] = [];

    private readonly httpService = inject(HttpClientService);
    private readonly mapService = inject(MapGameService);
    private readonly socketService = inject(SocketService);
    readonly gameController = inject(GameControllerService);

    private mapServiceSubscription: Subscription = new Subscription();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
    ) {}

    ngOnInit() {
        this.gameController.setRoomId(this.route.snapshot.params['roomId']);
        this.gameController.setPlayerId(this.route.snapshot.params['playerId']);
        this.subscribePlayersInitialized();

        this.listenMovement();
        this.listenInteractDoor();
        this.listenStartTurn();
        this.listenEndTurn();
        this.listenQuitGame();

        this.getGame(this.route.snapshot.params['gameId']).then(() => {
            this.mapService.setTiles(this.game.map as GameTile[]);
            this.mapSize = parseInt(this.game.mapSize, 10);
            this.gameCreated = true;
            this.gameController.requestGameSetup(this.route.snapshot.params['isAdmin'] === 'true');
        });
    }

    subscribePlayersInitialized() {
        this.gameController.playersInitializedBool$.subscribe((playersInitialized) => {
            this.playersInitialized = playersInitialized;
            if (this.playersInitialized) {
                console.log('Players initialized', this.playersInitialized);
                this.initializePlayersPositions();
                this.gameController.requestStartTurn();
            }
        });
    }

    listenStartTurn() {
        this.socketService.on('startTurn', (shortestPathByTile: ShortestPathByTile) => {
            this.initializeMovementPrevisualization(shortestPathByTile);
            this.subscribeMapService();
        });
    }

    listenInteractDoor() {
        this.socketService.on('interactDoor', (data: { isToggable: boolean; doorPosition: number; availableMoves: ShortestPathByTile }) => {
            if (data.isToggable) {
                this.mapService.toggleDoor(data.doorPosition);
            }
            this.mapService.actionDoor = false;
            this.endMovement(data.availableMoves);
        });
    }

    listenMovement() {
        this.socketService.on('playerPositionUpdate', (data: { playerId: string; newPlayerPosition: number }) => {
            this.updatePlayerPosition(data.playerId, data.newPlayerPosition);
        });
        this.socketService.on('endMove', (data: { availableMoves: ShortestPathByTile; currentMoveBudget: number }) => {
            this.currentMoveBudget = data.currentMoveBudget;
            this.mapService.isMoving = false;
            this.endMovement(data.availableMoves);
        });
    }

    listenEndTurn() {
        this.socketService.on('endTurn', (turn: number) => {
            this.activePlayer = this.playerCoords[turn].player;
            this.turn = turn;
            this.gameController.requestStartTurn();
        });
    }

    initializePlayersPositions() {
        this.gameController.getPlayerCoords().forEach((playerCoord) => {
            this.mapService.placePlayer(playerCoord.position, playerCoord.player);
        });
        this.mapService.removeUnusedStartingPoints();
    }

    // startTurn() {
    //     if (this.activePlayer.id === this.player.id) {
    //         this.socketService.emit('startTurn', { roomId: this.roomId, playerId: this.activePlayer.id });
    //     }
    // }

    subscribeMapService() {
        this.mapServiceSubscription = this.mapService.event$.subscribe((index) => {
            this.mapService.removeAllPreview();
            if (this.mapService.isMoving) {
                this.socketService.emit('move', { roomId: this.roomId, playerId: this.player.id, endPosition: index });
            } else if (this.mapService.actionDoor) {
                this.socketService.emit('interactDoor', { roomId: this.roomId, playerId: this.player.id, doorPosition: index });
            }
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
        }
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

    listenQuitGame() {
        this.socketService.on('quitGame', (playerId: string) => {
            const afkPlayer = this.playerCoords.find((playerCoord) => playerCoord.player.id === playerId);
            if (afkPlayer) {
                afkPlayer.player.abandoned = true;
                this.afklist.push(afkPlayer);
                this.playerCoords = this.playerCoords.filter((playerCoord) => playerCoord.player.id !== playerId);
            }
        });
    }

    endTurn() {
        this.mapService.removeAllPreview();
        this.resetMovementPrevisualization();
        this.mapServiceSubscription.unsubscribe();
        this.socketService.emit('endTurn', { roomId: this.roomId, playerId: this.player?.id, lastTurn: false });
    }

    quitGame() {
        this.socketService.emit('quitGame', { roomId: this.roomId, playerId: this.player.id });
        this.router.navigate(['/home']);
    }

    startAction() {
        this.mapService.setState(new Combat());
    }

    ngOnDestroy() {
        this.mapServiceSubscription.unsubscribe();
        this.socketService.disconnect();
    }
}
