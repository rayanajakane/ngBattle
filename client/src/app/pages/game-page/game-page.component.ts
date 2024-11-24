import { Component, inject, OnDestroy, OnInit } from '@angular/core';
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
import { LogsComponent } from '@app/components/logs/logs.component';
import { PlayerPanelComponent } from '@app/components/player-panel/player-panel.component';
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
        ChatComponent,
        InventoryComponent,
        MatCardModule,
        MatIconModule,
        MatListModule,
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
    attackSuccessful: boolean;

    gameCreated = false;
    playersInitialized = false;

    remainingEscapeChances: number | '--' = '--';

    combatInitiatorId: string = '';

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
        this.listenKilledPlayer();
        this.listenEscaped();
        this.listenEndCombat();
        this.listenAvailableMovesOnBudget();
        this.listenEnCombatTimer();

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
            this.timerState = TimerState.COOLDOWN;
            // this.gameController.requestStartTurn(); //
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
        this.socketService.on('endMove', (data: { availableMoves: ShortestPathByTile; currentMoveBudget: number; hasSlipped: boolean }) => {
            console.log('endMove', data);
            this.currentMoveBudget = data.currentMoveBudget;
            if (data.hasSlipped) {
                this.endTurn();
            } else {
                this.endMovement(data.availableMoves);
            }
        });
    }

    listenEndTurn() {
        this.socketService.on('endTurn', (activePlayerId: string) => {
            this.timerState = TimerState.COOLDOWN;
            this.gameController.setActivePlayer(activePlayerId);
            // this.gameController.requestStartTurn(); //
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
            if (availableTiles.length > 0) {
                this.mapService.switchToActionStateRoutine(availableTiles);
            }
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

    listenCombatTimer() {
        this.socketService.on('CombatTimerUpdate', (time: number) => {
            if (this.gameController.isInCombat()) {
                this.timeLeft = time;
            }
        });
    }

    listenEnCombatTimer() {
        this.socketService.on('endCombatTimer', () => {
            if (this.gameController.isActivePlayer()) {
                this.gameController.requestCombatAction('attack');
            }
        });
    }

    listenStartCombat() {
        this.socketService.on('startCombat', (combatData: { attacker: PlayerCoord; defender: PlayerCoord; combatInitiatorId: string }) => {
            console.log('iceDisadvantage', combatData.defender.player.attributes.currentAttack, combatData.defender.player.attributes.currentDefense);
            this.remainingEscapeChances = 2;
            this.combatInitiatorId = combatData.combatInitiatorId;
            this.gameController.updatePlayerCoordsList([combatData.attacker, combatData.defender]);
            this.gameController.setActivePlayer(combatData.attacker.player.id);
            if (this.gameController.isFighter([combatData.attacker, combatData.defender])) {
                this.timerState = TimerState.COMBAT;
                this.gameController.setFighters([combatData.attacker, combatData.defender]);
                if (this.gameController.isActivePlayer()) {
                    this.mapService.setState(GameState.COMBAT); // fighter[0] <- initier combat ; fighter[1] <- recevoir combat
                    this.remainingActions = 0;
                }
            } else {
                this.timerState = TimerState.NONE;
                this.timeLeft = '--';
            }
            console.log('GameState', this.mapService.currentStateNumber);
        });
    }

    listenAttacked() {
        this.socketService.on(
            'attacked',
            (data: { attacker: PlayerCoord; attackerDice: number; defender: PlayerCoord; defenderDice: number; isAttackSuccessful: boolean }) => {
                if (this.gameController.isInCombat()) {
                    this.attackerDiceResult = data.attackerDice;
                    this.defenderDiceResult = data.defenderDice;
                    this.attackSuccessful = data.isAttackSuccessful;
                    console.log('lifePoints', data.defender.player.attributes.health);
                    this.gameController.updatePlayerCoordsList([data.attacker, data.defender]);
                }
            },
        );
    }

    listenChangeCombatTurn() {
        this.socketService.on('changeCombatTurn', (newAttackerId: string) => {
            this.gameController.setActivePlayer(newAttackerId);
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
            // this.gameController.updatePlayerCoordsList([data.killer, data.killed]);
            this.mapService.changePlayerPosition(data.killedOldPosition, data.killed.position, data.killed.player);
            this.gameController.setActivePlayer(this.combatInitiatorId);
            if (this.gameController.isActivePlayer()) {
                if (this.combatInitiatorId === data.killed.player.id) {
                    this.currentMoveBudget = 0;
                } else if (this.combatInitiatorId === data.killer.player.id) {
                    if (this.currentMoveBudget !== '--') {
                        this.gameController.requestAvailableMovesOnBudget(this.currentMoveBudget);
                    }
                }
            }
        });
    }

    listenAvailableMovesOnBudget() {
        this.socketService.on('availableMovesOnBudget', (availableMoves: ShortestPathByTile) => {
            if (this.gameController.isActivePlayer()) {
                this.mapService.switchToMovingStateRoutine(availableMoves);
            }
        });
    }

    listenEscaped() {
        this.socketService.on('didEscape', (data: { playerId: string; remainingEscapeChances: number; hasEscaped: boolean }) => {
            if (this.gameController.isInCombat()) {
                console.log('escaped', data.remainingEscapeChances, data.hasEscaped);
                if (data.hasEscaped) {
                    this.gameController.setActivePlayer(this.combatInitiatorId);
                    this.remainingEscapeChances = '--';
                } else if (this.gameController.isActivePlayer()) {
                    this.remainingEscapeChances = data.remainingEscapeChances;
                }
            }
        });
    }

    listenEndCombat() {
        this.socketService.on('endCombat', (newFighters: PlayerCoord[]) => {
            this.gameController.updatePlayerCoordsList(newFighters);
            this.mapService.setState(GameState.NOTPLAYING);
            this.timerState = TimerState.REGULAR;
            if (this.gameController.isActivePlayer()) {
                if (this.currentMoveBudget === 0) {
                    this.gameController.requestEndTurn();
                } else {
                    this.mapService.switchToMovingStateRoutine();
                }
            }
            this.gameController.resetFighters();
            this.combatInitiatorId = '';
        });
    }

    handleSelectCombatAction(combatAction: string) {
        if (this.gameController.isActivePlayer()) {
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
        // this.gameController.requestQuitGame();
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
