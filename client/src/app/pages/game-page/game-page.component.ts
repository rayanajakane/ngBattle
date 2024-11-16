import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { CombatInterfaceComponent } from '@app/components/combat-interface/combat-interface.component';
import { CombatTimerComponent } from '@app/components/combat-timer/combat-timer.component';
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
import { GameState, GameStructure, GameTile, TimerState } from '@common/game-structure';
import { PlayerCoord } from '@common/player';

export interface ShortestPathByTile {
    [key: number]: number[];
}

@Component({
    selector: 'app-game-page',
    standalone: true,
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
    imports: [
        CombatTimerComponent,
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

    currentMoveBudget: number | '--' = '--';
    remainingActions: number | '--' = '--';
    timeLeft: number | '--' = '--';
    timerState: TimerState = TimerState.COOLDOWN;

    attackerDiceResult: number = 0;
    defenderDiceResult: number = 0;

    gameCreated = false;
    playersInitialized = false;

    private readonly httpService = inject(HttpClientService);
    private readonly mapService = inject(MapGameService);
    private readonly socketService = inject(SocketService);
    readonly gameController = inject(GameControllerService);

    constructor(
        private route: ActivatedRoute,
        private router: Router,
    ) {}

    ngOnInit() {
        this.gameController.setRoomId(this.route.snapshot.params['roomId']);
        this.gameController.setPlayerId(this.route.snapshot.params['playerId']);

        this.listenGameSetup();
        this.listenMovement();
        this.listenStartAction();
        this.listenInteractDoor();
        this.listenStartTurn();
        this.listenEndTurn();
        this.listenQuitGame();
        this.listenTimer();
        this.listenEndTimer();
        this.listenEndCooldown();
        this.listenStartCombat();
        this.listenCombatTimer();
        this.listenAttacked();
        this.listenChangeCombatTurn();

        this.getGame(this.route.snapshot.params['gameId']).then(() => {
            this.mapService.setTiles(this.game.map as GameTile[]);
            this.mapSize = parseInt(this.game.mapSize, 10);
            this.gameCreated = true;
            this.gameController.requestGameSetup(this.route.snapshot.params['isAdmin'] === 'true');
        });
    }

    listenGameSetup() {
        this.socketService.once('gameSetup', (data: { playerCoords: PlayerCoord[]; turn: number }) => {
            this.gameController.initializePlayers(data.playerCoords, data.turn);
            this.playersInitialized = true;
            this.initializePlayersPositions();
            this.mapService.setState(GameState.NOTPLAYING);
        });
    }

    listenStartTurn() {
        this.socketService.on('startTurn', (data: { shortestPathByTile: ShortestPathByTile; currentMoveBudget: number }) => {
            this.mapService.switchToMovingStateRoutine(data.shortestPathByTile);
            this.currentMoveBudget = data.currentMoveBudget;
            this.remainingActions = 1;
        });
    }

    listenInteractDoor() {
        this.socketService.on('interactDoor', (data: { isToggable: boolean; doorPosition: number; availableMoves: ShortestPathByTile }) => {
            if (data.isToggable) {
                this.mapService.toggleDoor(data.doorPosition);
            }
            if (this.gameController.isActivePlayer()) {
                this.remainingActions = 0;
                this.endMovement(data.availableMoves);
            }
        });
    }

    listenMovement() {
        this.socketService.on('playerPositionUpdate', (data: { playerId: string; newPlayerPosition: number }) => {
            console.log('playerPositionUpdate', data.newPlayerPosition);
            this.updatePlayerPosition(data.playerId, data.newPlayerPosition);
        });
        this.socketService.on('endMove', (data: { availableMoves: ShortestPathByTile; currentMoveBudget: number }) => {
            this.currentMoveBudget = data.currentMoveBudget;
            this.endMovement(data.availableMoves);
        });
    }

    listenEndTurn() {
        this.socketService.on('endTurn', (activePlayerId: string) => {
            this.timerState = TimerState.COOLDOWN;
            this.gameController.setActivePlayer(activePlayerId);
            //this.gameController.requestStartTurn();
        });
    }

    initializePlayersPositions() {
        this.gameController.getPlayerCoords().forEach((playerCoord) => {
            this.mapService.placePlayer(playerCoord.position, playerCoord.player);
        });
        this.mapService.removeUnusedStartingPoints();
    }

    updatePlayerPosition(playerId: string, newPlayerPosition: number) {
        const playerCoord = this.gameController.findPlayerCoordById(playerId);
        if (playerCoord) {
            this.mapService.changePlayerPosition(playerCoord.position, newPlayerPosition, playerCoord.player);
            playerCoord.position = newPlayerPosition;
        }
    }

    endMovement(shortestPathByTile: ShortestPathByTile) {
        const currentPlayerPosition = this.gameController.findPlayerCoordById(this.gameController.playerId)?.position;

        if (Object.keys(shortestPathByTile).length !== 0) {
            this.mapService.switchToMovingStateRoutine(shortestPathByTile);
        } else if (
            currentPlayerPosition &&
            (this.remainingActions === 0 || !this.mapService.checkIfTargetAvailable(currentPlayerPosition, this.mapSize))
        ) {
            this.endTurn();
        } else {
            this.mapService.resetMovementPrevisualization();
            this.mapService.setState(GameState.MOVING);
        }
    }

    async getGame(gameId: string) {
        this.game = await this.httpService.getGame(gameId);
    }

    listenQuitGame() {
        this.socketService.on('quitGame', (playerId: string) => {
            if (this.gameController.isActivePlayer()) {
                this.gameController.requestEndTurn(true);
                this.socketService.disconnect();
                this.router.navigate(['/home']);
            }
            this.gameController.feedAfkList(playerId);
            this.mapService.removePlayerById(playerId);
        });
    }

    listenStartAction() {
        this.socketService.on('startAction', (availableTiles: number[]) => {
            console.log('startAction', availableTiles);
            this.mapService.switchToActionStateRoutine(availableTiles);
        });
    }

    listenTimer() {
        this.socketService.on('timerUpdate', (time: number) => {
            this.timeLeft = time;
        });
    }

    listenEndTimer() {
        this.socketService.on('endTimer', () => {
            this.endTurn();
        });
    }

    listenEndCooldown() {
        this.socketService.on('endCooldown', () => {
            this.timerState = TimerState.REGULAR;
            this.gameController.requestStartTurn();
        });
    }

    listenStartCombat() {
        this.socketService.on('startCombat', (combatData: { attacker: PlayerCoord; defender: PlayerCoord }) => {
            this.gameController.setActivePlayer(combatData.attacker.player.id);
            if (this.gameController.isFighter([combatData.attacker, combatData.defender])) {
                this.gameController.setFighters([combatData.attacker, combatData.defender]);
                this.mapService.setState(GameState.COMBAT);
            } else {
                this.timeLeft = '--';
            }
            console.log('GameState', this.mapService.currentStateNumber);
        });
    }

    listenCombatTimer() {
        this.socketService.on('combatTimerUpdate', (time: number) => {
            if (this.gameController.isInCombat()) {
                this.timeLeft = time;
            }
        });
    }

    listenAttacked() {
        this.socketService.on('attacked', (data: { attacker: PlayerCoord; attackerDice: number; defender: PlayerCoord; defenderDice: number }) => {
            if (this.gameController.isInCombat()) {
                this.attackerDiceResult = data.attackerDice;
                this.defenderDiceResult = data.defenderDice;
                this.gameController.updatePlayerCoordsList([data.attacker, data.defender]);
            }
        });
    }

    listenChangeCombatTurn() {
        this.socketService.on('changeCombatTurn', (attackerId: string) => {
            this.gameController.setActivePlayer(attackerId);
            if (this.gameController.isInCombat()) {
                if (this.gameController.isActivePlayer()) {
                    this.mapService.setState(GameState.COMBAT);
                } else {
                    this.mapService.setState(GameState.NOTPLAYING);
                }
            }
        });
    }

    listenKilledPlayer() {
        this.socketService.on('killedPlayer', (data: { killer: PlayerCoord; killed: PlayerCoord; killedOldPosition: number }) => {
            this.gameController.updatePlayerCoordsList([data.killer, data.killed]);
            this.mapService.changePlayerPosition(data.killedOldPosition, data.killed.position, data.killed.player);
        });
    }

    listenEndCombat() {}

    listenEscaped() {
        this.socketService.on('didEscape', (data: { result: boolean }) => {
            if (this.gameController.isInCombat()) {
                console.log('escaped', data);
            }
        });
    }

    listenEndCombat() {
        this.socketService.on('endCombat', (fighters: PlayerCoord[]) => {
            this.gameController.resetFighters();
            this.mapService.setState(GameState.NOTPLAYING);
        });
    }

    handleSelectCombatAction(combatAction: string) {
        if (this.gameController.isActivePlayer()) {
            console.log('combatAction', combatAction);
            this.gameController.requestCombatAction(combatAction);
        }
    }

    endTurn() {
        if (this.gameController.isActivePlayer()) {
            this.resetPlayerView();
            this.gameController.requestEndTurn();
        }
    }

    resetPlayerView() {
        this.mapService.resetAllMovementPrevisualization();
        this.mapService.removeAllPreview();
        this.mapService.setState(GameState.NOTPLAYING);
        this.currentMoveBudget = '--';
        this.remainingActions = '--';
    }

    quitGame() {
        this.gameController.requestQuitGame();
        // this.socketService.disconnect();
        // this.router.navigate(['/home']);
    }

    startAction() {
        console.log('currentState', this.mapService.currentStateNumber);
        if (this.remainingActions === 1 && this.mapService.currentStateNumber === GameState.MOVING) {
            this.gameController.requestStartAction();
        }
    }

    ngOnDestroy() {
        this.mapService.resetMovementPrevisualization();
        this.socketService.disconnect();
    }
}
