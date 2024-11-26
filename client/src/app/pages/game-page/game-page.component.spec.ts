import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { MOCK_PLAYER_COORD, MOCK_PLAYER_COORDS, MOCKGAME, TEST_AVAILABLE_TILES, TEST_SHORTEST_PATH } from '@app/services/constants';
import { GameControllerService } from '@app/services/game-controller.service';
import { HttpClientService } from '@app/services/http-client.service';
import { MapGameService } from '@app/services/map-game.service';
import { SocketService } from '@app/services/socket.service';
import { GameState, GameTile, TimerState } from '@common/game-structure';
import { ENDGAME_DELAY, MAX_NUMBER_OF_WINS } from './constant';
import { GamePageComponent } from './game-page.component';

/* eslint-disable max-lines */
describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let gameControllerService: jasmine.SpyObj<GameControllerService>;
    let httpClientService: jasmine.SpyObj<HttpClientService>;
    let mapGameService: jasmine.SpyObj<MapGameService>;
    let socketService: jasmine.SpyObj<SocketService>;
    let router: jasmine.SpyObj<Router>;
    let snackbar: jasmine.SpyObj<MatSnackBar>;

    beforeEach(async () => {
        const gameControllerSpy = jasmine.createSpyObj('GameControllerService', [
            'setRoom',
            'requestGameSetup',
            'initializePlayers',
            'setActivePlayer',
            'requestStartTurn',
            'requestEndTurn',
            'requestCombatAction',
            'updateActiveFighter',
            'setFighters',
            'resetFighters',
            'updatePlayerCoordsList',
            'findPlayerCoordById',
            'isActivePlayer',
            'isInCombat',
            'isFighter',
            'requestAvailableMovesOnBudget',
            'requestCheckAction',
            'requestStartAction',
            'feedAfkList',
        ]);
        const httpClientSpy = jasmine.createSpyObj('HttpClientService', ['getGame']);
        const mapGameSpy = jasmine.createSpyObj('MapGameService', [
            'setTiles',
            'initializePlayersPositions',
            'setState',
            'switchToMovingStateRoutine',
            'switchToActionStateRoutine',
            'resetMovementPrevisualization',
            'resetPlayerView',
            'resetMap',
            'changePlayerPosition',
            'toggleDoor',
            'removePlayerById',
        ]);
        const socketSpy = jasmine.createSpyObj('SocketService', ['once', 'on', 'disconnect']);
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        const snackbarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        await TestBed.configureTestingModule({
            imports: [GamePageComponent, BrowserAnimationsModule],
            providers: [
                { provide: GameControllerService, useValue: gameControllerSpy },
                { provide: HttpClientService, useValue: httpClientSpy },
                { provide: MapGameService, useValue: mapGameSpy },
                { provide: SocketService, useValue: socketSpy },
                { provide: Router, useValue: routerSpy },
                { provide: MatSnackBar, useValue: snackbarSpy },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            params: {
                                roomId: 'testRoom',
                                playerId: 'testPlayer',
                                gameId: 'testGame',
                                isAdmin: 'true',
                            },
                        },
                    },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        gameControllerService = TestBed.inject(GameControllerService) as jasmine.SpyObj<GameControllerService>;
        httpClientService = TestBed.inject(HttpClientService) as jasmine.SpyObj<HttpClientService>;
        mapGameService = TestBed.inject(MapGameService) as jasmine.SpyObj<MapGameService>;
        socketService = TestBed.inject(SocketService) as jasmine.SpyObj<SocketService>;
        router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        snackbar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

        httpClientService.getGame.and.returnValue(Promise.resolve(MOCKGAME));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set room and add listeners on init', () => {
        expect(gameControllerService.setRoom).toHaveBeenCalledWith('testRoom', 'testPlayer');
        expect(socketService.once).toHaveBeenCalled();
        expect(socketService.on).toHaveBeenCalled();
    });

    it('should get game and initiate game setup', async () => {
        expect(httpClientService.getGame).toHaveBeenCalledWith('testGame');
    });

    it('should initiate game setup correctly', () => {
        component.isAdmin = true;
        component.initiateGameSetup(MOCKGAME);
        expect(mapGameService.setTiles).toHaveBeenCalledWith(MOCKGAME.map as GameTile[]);
        expect(component.mapSize).toBe(parseInt(MOCKGAME.mapSize, 10));
        expect(component.gameCreated).toBeTrue();
        expect(gameControllerService.requestGameSetup).toHaveBeenCalled();
    });

    it('should initiate game setup correctly', () => {
        component.isAdmin = false;
        component.initiateGameSetup(MOCKGAME);
        expect(gameControllerService.requestGameSetup).not.toHaveBeenCalled();
    });

    it('should handle game setup', () => {
        const playerCoords = MOCK_PLAYER_COORDS;
        component.handleGameSetup(playerCoords, 1);
        expect(gameControllerService.initializePlayers).toHaveBeenCalledWith(playerCoords, 1);
        expect(component.playersInitialized).toBeTrue();
        expect(mapGameService.initializePlayersPositions).toHaveBeenCalledWith(playerCoords);
        expect(mapGameService.setState).toHaveBeenCalledWith(GameState.NOTPLAYING);
        expect(component.timerState).toBe(TimerState.COOLDOWN);
    });

    it('should add listeners', () => {
        spyOn(component, 'listenGameSetup');
        spyOn(component, 'listenTurns');
        spyOn(component, 'listenCombatTurns');
        spyOn(component, 'listenTimer');
        spyOn(component, 'listenCombatTimer');
        spyOn(component, 'listenMovement');
        spyOn(component, 'listenActions');
        spyOn(component, 'listenCombatActions');
        spyOn(component, 'listenEndGameEvents');

        component.addListeners();

        expect(component.listenGameSetup).toHaveBeenCalled();
        expect(component.listenTurns).toHaveBeenCalled();
        expect(component.listenCombatTurns).toHaveBeenCalled();
        expect(component.listenTimer).toHaveBeenCalled();
        expect(component.listenCombatTimer).toHaveBeenCalled();
        expect(component.listenMovement).toHaveBeenCalled();
        expect(component.listenActions).toHaveBeenCalled();
        expect(component.listenCombatActions).toHaveBeenCalled();
        expect(component.listenEndGameEvents).toHaveBeenCalled();
    });

    it('should listen for game setup and handle it', () => {
        const mockData = { playerCoords: MOCK_PLAYER_COORDS, turn: 1 };
        spyOn(component, 'handleGameSetup');

        component.listenGameSetup();
        socketService.once.calls.mostRecent().args[1](mockData);

        expect(socketService.once).toHaveBeenCalledWith('gameSetup', jasmine.any(Function));
        expect(component.handleGameSetup).toHaveBeenCalledWith(mockData.playerCoords, mockData.turn);
    });

    it('should listen for startTurn and handle it', () => {
        const mockData = { shortestPathByTile: {}, currentMoveBudget: 3 };

        component.listenTurns();
        socketService.on.calls.argsFor(0)[1](mockData);

        expect(socketService.on).toHaveBeenCalledWith('startTurn', jasmine.any(Function));
        expect(mapGameService.switchToMovingStateRoutine).toHaveBeenCalledWith(mockData.shortestPathByTile);
        expect(component.currentMoveBudget).toBe(mockData.currentMoveBudget);
        expect(component.remainingActions).toBe(1);
    });

    it('should listen for endTurn and handle it', () => {
        const mockActivePlayerId = 'testPlayerId';

        component.listenTurns();
        socketService.on.calls.argsFor(1)[1](mockActivePlayerId);

        expect(socketService.on).toHaveBeenCalledWith('endTurn', jasmine.any(Function));
        expect(component.timerState).toBe(TimerState.COOLDOWN);
        expect(gameControllerService.setActivePlayer).toHaveBeenCalledWith(mockActivePlayerId);
    });

    it('should listen for startCombat and handle it', () => {
        const mockCombatData = { attacker: MOCK_PLAYER_COORDS[0], defender: MOCK_PLAYER_COORDS[1], combatInitiatorId: 'testInitiator' };
        spyOn(component, 'handleStartCombat');

        socketService.on.calls.argsFor(2)[1](mockCombatData);

        expect(socketService.on).toHaveBeenCalledWith('startCombat', jasmine.any(Function));
        expect(component.handleStartCombat).toHaveBeenCalledWith(mockCombatData.attacker, mockCombatData.defender, mockCombatData.combatInitiatorId);
    });

    it('should listen for changeCombatTurn and handle it', () => {
        const mockNewAttackerId = 'newAttackerId';
        spyOn(component, 'handleChangeCombatTurn');

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(3)[1](mockNewAttackerId);

        expect(socketService.on).toHaveBeenCalledWith('changeCombatTurn', jasmine.any(Function));
        expect(component.handleChangeCombatTurn).toHaveBeenCalledWith(mockNewAttackerId);
    });

    it('should listen for endCombat and handle it', () => {
        const mockNewFighters = MOCK_PLAYER_COORDS;
        spyOn(component, 'handleEndCombat');

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(4)[1](mockNewFighters);

        expect(socketService.on).toHaveBeenCalledWith('endCombat', jasmine.any(Function));
        expect(component.handleEndCombat).toHaveBeenCalledWith(mockNewFighters);
    });

    it('should listen for timerUpdate and update timeLeft', () => {
        const mockTime = 10;

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(5)[1](mockTime);

        expect(socketService.on).toHaveBeenCalledWith('timerUpdate', jasmine.any(Function));
        expect(component.timeLeft).toBe(mockTime);
    });

    it('should listen for endTimer and call endTurn', () => {
        spyOn(component, 'endTurn');

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(6)[1](undefined);

        expect(socketService.on).toHaveBeenCalledWith('endTimer', jasmine.any(Function));
        expect(component.endTurn).toHaveBeenCalled();
    });

    it('should listen for endCooldown and update timerState and request start turn', () => {
        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(7)[1](undefined);

        expect(socketService.on).toHaveBeenCalledWith('endCooldown', jasmine.any(Function));
        expect(component.timerState).toBe(TimerState.REGULAR);
        expect(gameControllerService.requestStartTurn).toHaveBeenCalled();
    });

    it('should listen for CombatTimerUpdate and update timeLeft if in combat', () => {
        const mockTime = 10;
        gameControllerService.isInCombat.and.returnValue(true);

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(8)[1](mockTime);

        expect(socketService.on).toHaveBeenCalledWith('CombatTimerUpdate', jasmine.any(Function));
        expect(component.timeLeft).toBe(mockTime);
    });

    it('should listen for endCombatTimer and request combat action if active player', () => {
        gameControllerService.isActivePlayer.and.returnValue(true);

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(9)[1](undefined);

        expect(socketService.on).toHaveBeenCalledWith('endCombatTimer', jasmine.any(Function));
        expect(gameControllerService.requestCombatAction).toHaveBeenCalledWith('attack');
    });

    it('should listen for playerPositionUpdate and update player position', () => {
        const mockData = { playerId: 'testPlayerId', newPlayerPosition: 5 };
        spyOn(component, 'updatePlayerPosition');

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(10)[1](mockData);

        expect(socketService.on).toHaveBeenCalledWith('playerPositionUpdate', jasmine.any(Function));
        expect(component.updatePlayerPosition).toHaveBeenCalledWith(mockData.playerId, mockData.newPlayerPosition);
    });

    it('should listen for endMove and handle it', () => {
        const mockData = { availableMoves: {}, currentMoveBudget: 3, hasSlipped: false };
        spyOn(component, 'handleEndMove');

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(11)[1](mockData);

        expect(socketService.on).toHaveBeenCalledWith('endMove', jasmine.any(Function));
        expect(component.handleEndMove).toHaveBeenCalledWith(mockData.availableMoves, mockData.currentMoveBudget, mockData.hasSlipped);
    });

    it('should listen for startAction and switch to action state if tiles available', () => {
        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(12)[1](TEST_AVAILABLE_TILES);

        expect(socketService.on).toHaveBeenCalledWith('startAction', jasmine.any(Function));
        expect(mapGameService.switchToActionStateRoutine).toHaveBeenCalledWith(TEST_AVAILABLE_TILES);
    });

    it('should listen for checkValidAction and handle it', () => {
        spyOn(component, 'handleCheckValidAction');

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(13)[1](TEST_AVAILABLE_TILES);

        expect(socketService.on).toHaveBeenCalledWith('checkValidAction', jasmine.any(Function));
        expect(component.handleCheckValidAction).toHaveBeenCalledWith(TEST_AVAILABLE_TILES);
    });

    it('should listen for interactDoor and handle it', () => {
        const mockData = { isToggable: true, doorPosition: 1, availableMoves: {} };
        spyOn(component, 'handleInteractDoor');

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(14)[1](mockData);

        expect(socketService.on).toHaveBeenCalledWith('interactDoor', jasmine.any(Function));
        expect(component.handleInteractDoor).toHaveBeenCalledWith(mockData.isToggable, mockData.doorPosition, mockData.availableMoves);
    });

    it('should listen for availableMovesOnBudget and switch to moving state if active player', () => {
        const mockAvailableMoves = {};
        gameControllerService.isActivePlayer.and.returnValue(true);

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(15)[1](mockAvailableMoves);

        expect(socketService.on).toHaveBeenCalledWith('availableMovesOnBudget', jasmine.any(Function));
        expect(mapGameService.switchToMovingStateRoutine).toHaveBeenCalledWith(mockAvailableMoves);
    });

    it('should listen for attacked and handle it if in combat', () => {
        const mockData = {
            attacker: MOCK_PLAYER_COORDS[0],
            attackerDice: 5,
            defender: MOCK_PLAYER_COORDS[1],
            defenderDice: 3,
            isAttackSuccessful: true,
        };
        spyOn(component, 'handleAttacked');

        gameControllerService.isInCombat.and.returnValue(true);

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(16)[1](mockData);

        expect(socketService.on).toHaveBeenCalledWith('attacked', jasmine.any(Function));
        expect(component.handleAttacked).toHaveBeenCalledWith(
            mockData.attacker,
            mockData.attackerDice,
            mockData.defender,
            mockData.defenderDice,
            mockData.isAttackSuccessful,
        );
    });

    it('should listen for attacked and handle it if in combat', () => {
        const mockData = {
            attacker: MOCK_PLAYER_COORDS[0],
            attackerDice: 5,
            defender: MOCK_PLAYER_COORDS[1],
            defenderDice: 3,
            isAttackSuccessful: true,
        };
        spyOn(component, 'handleAttacked');

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(16)[1](mockData);

        expect(socketService.on).toHaveBeenCalledWith('attacked', jasmine.any(Function));
        expect(component.handleAttacked).not.toHaveBeenCalled();
    });

    it('should listen for killedPlayer and handle it', () => {
        const mockData = { killer: MOCK_PLAYER_COORDS[0], killed: MOCK_PLAYER_COORDS[1], killedOldPosition: 5 };
        spyOn(component, 'handleKilledPlayer');

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(17)[1](mockData);

        expect(socketService.on).toHaveBeenCalledWith('killedPlayer', jasmine.any(Function));
        expect(component.handleKilledPlayer).toHaveBeenCalledWith(mockData.killer, mockData.killed, mockData.killedOldPosition);
    });

    it('should listen for killedPlayer and handle it', () => {
        const mockData = { killer: MOCK_PLAYER_COORDS[0], killed: MOCK_PLAYER_COORDS[1], killedOldPosition: 5 };
        const usualWinNumber = 0;
        mockData.killer.player.wins = MAX_NUMBER_OF_WINS;

        spyOn(component, 'handleKilledPlayer');

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(17)[1](mockData);

        mockData.killer.player.wins = usualWinNumber;

        expect(socketService.on).toHaveBeenCalledWith('killedPlayer', jasmine.any(Function));
        expect(component.handleKilledPlayer).not.toHaveBeenCalled();
    });

    it('should listen for didEscape and handle it', () => {
        const mockData = { playerId: 'testPlayerId', remainingEscapeChances: 1, hasEscaped: true };
        spyOn(component, 'handleEscaped');
        gameControllerService.isInCombat.and.returnValue(true);

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(18)[1](mockData);

        expect(socketService.on).toHaveBeenCalledWith('didEscape', jasmine.any(Function));
        expect(component.handleEscaped).toHaveBeenCalledWith(mockData.remainingEscapeChances, mockData.hasEscaped);
    });

    it('should listen for didEscape and handle it', () => {
        const mockData = { playerId: 'testPlayerId', remainingEscapeChances: 1, hasEscaped: true };
        spyOn(component, 'handleEscaped');

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(18)[1](mockData);

        expect(socketService.on).toHaveBeenCalledWith('didEscape', jasmine.any(Function));
        expect(component.handleEscaped).not.toHaveBeenCalled();
    });

    it('should listen for quitGame and handle it', () => {
        const mockPlayerId = 'testPlayerId';

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(19)[1](mockPlayerId);

        expect(socketService.on).toHaveBeenCalledWith('quitGame', jasmine.any(Function));
        expect(gameControllerService.feedAfkList).toHaveBeenCalledWith(mockPlayerId);
        expect(mapGameService.removePlayerById).toHaveBeenCalledWith(mockPlayerId);
    });

    it('should listen for lastManStanding and handle it', () => {
        spyOn(component, 'redirectLastManStanding');

        component.listenEndGameEvents();

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(20)[1](undefined);

        expect(socketService.on).toHaveBeenCalledWith('lastManStanding', jasmine.any(Function));
        expect(component.redirectLastManStanding).toHaveBeenCalled();
    });

    it('should listen for endGame and handle it', () => {
        const mockEndGameMessage = 'Game Over';
        spyOn(component, 'redirectEndGame');

        component.listenEndGameEvents();

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(21)[1](mockEndGameMessage);

        expect(socketService.on).toHaveBeenCalledWith('endGame', jasmine.any(Function));
        expect(component.redirectEndGame).toHaveBeenCalledWith(mockEndGameMessage);
    });

    it('should handle start combat and set timer state to COMBAT if player is a fighter', () => {
        const mockAttacker = MOCK_PLAYER_COORDS[0];
        const mockDefender = MOCK_PLAYER_COORDS[1];
        const mockCombatInitiatorId = 'testInitiator';
        gameControllerService.isFighter.and.returnValue(true);
        gameControllerService.isActivePlayer.and.returnValue(true);

        component.handleStartCombat(mockAttacker, mockDefender, mockCombatInitiatorId);

        expect(component.remainingEscapeChances).toBe(2);
        expect(component.combatInitiatorId).toBe(mockCombatInitiatorId);
        expect(gameControllerService.updateActiveFighter).toHaveBeenCalledWith([mockAttacker, mockDefender], mockAttacker.player.id);
        expect(component.timerState).toBe(TimerState.COMBAT);
        expect(gameControllerService.setFighters).toHaveBeenCalledWith([mockAttacker, mockDefender]);
        expect(mapGameService.setState).toHaveBeenCalledWith(GameState.COMBAT);
        expect(component.remainingActions).toBe(0);
    });

    it('should handle start combat and set timer state to NONE if player is not a fighter', () => {
        const mockAttacker = MOCK_PLAYER_COORDS[0];
        const mockDefender = MOCK_PLAYER_COORDS[1];
        const mockCombatInitiatorId = 'testInitiator';
        gameControllerService.isFighter.and.returnValue(false);

        component.handleStartCombat(mockAttacker, mockDefender, mockCombatInitiatorId);

        expect(component.remainingEscapeChances).toBe(2);
        expect(component.combatInitiatorId).toBe(mockCombatInitiatorId);
        expect(gameControllerService.updateActiveFighter).toHaveBeenCalledWith([mockAttacker, mockDefender], mockAttacker.player.id);
        expect(component.timerState).toBe(TimerState.NONE);
        expect(component.timeLeft).toBe('--');
    });

    it('should handle start combat and not set state to COMBAT if player is not active', () => {
        const mockAttacker = MOCK_PLAYER_COORDS[0];
        const mockDefender = MOCK_PLAYER_COORDS[1];
        const mockCombatInitiatorId = 'testInitiator';
        gameControllerService.isFighter.and.returnValue(true);
        gameControllerService.isActivePlayer.and.returnValue(false);

        component.handleStartCombat(mockAttacker, mockDefender, mockCombatInitiatorId);

        expect(component.remainingEscapeChances).toBe(2);
        expect(component.combatInitiatorId).toBe(mockCombatInitiatorId);
        expect(gameControllerService.updateActiveFighter).toHaveBeenCalledWith([mockAttacker, mockDefender], mockAttacker.player.id);
        expect(component.timerState).toBe(TimerState.COMBAT);
        expect(gameControllerService.setFighters).toHaveBeenCalledWith([mockAttacker, mockDefender]);
        expect(mapGameService.setState).not.toHaveBeenCalledWith(GameState.COMBAT);
        expect(component.remainingActions).not.toBe(0);
    });

    it('should handle change combat turn and set state to COMBAT if in combat and active player', () => {
        const mockNewAttackerId = 'newAttackerId';
        gameControllerService.isInCombat.and.returnValue(true);
        gameControllerService.isActivePlayer.and.returnValue(true);

        component.handleChangeCombatTurn(mockNewAttackerId);

        expect(gameControllerService.setActivePlayer).toHaveBeenCalledWith(mockNewAttackerId);
        expect(mapGameService.setState).toHaveBeenCalledWith(GameState.COMBAT);
    });

    it('should handle change combat turn and set state to NOTPLAYING if in combat and not active player', () => {
        const mockNewAttackerId = 'newAttackerId';
        gameControllerService.isInCombat.and.returnValue(true);
        gameControllerService.isActivePlayer.and.returnValue(false);

        component.handleChangeCombatTurn(mockNewAttackerId);

        expect(gameControllerService.setActivePlayer).toHaveBeenCalledWith(mockNewAttackerId);
        expect(mapGameService.setState).toHaveBeenCalledWith(GameState.NOTPLAYING);
    });

    it('should handle change combat turn and not change state if not in combat', () => {
        const mockNewAttackerId = 'newAttackerId';
        gameControllerService.isInCombat.and.returnValue(false);

        component.handleChangeCombatTurn(mockNewAttackerId);

        expect(gameControllerService.setActivePlayer).toHaveBeenCalledWith(mockNewAttackerId);
        expect(mapGameService.setState).not.toHaveBeenCalled();
    });

    it('should handle end combat and update player coordinates list', () => {
        const mockNewFighters = MOCK_PLAYER_COORDS;

        component.handleEndCombat(mockNewFighters);

        expect(gameControllerService.updatePlayerCoordsList).toHaveBeenCalledWith(mockNewFighters);
        expect(mapGameService.setState).toHaveBeenCalledWith(GameState.NOTPLAYING);
        expect(component.timerState).toBe(TimerState.REGULAR);
    });

    it('should handle end combat and request end turn if active player and move budget is 0', () => {
        const mockNewFighters = MOCK_PLAYER_COORDS;
        component.currentMoveBudget = 0;
        gameControllerService.isActivePlayer.and.returnValue(true);

        component.handleEndCombat(mockNewFighters);

        expect(gameControllerService.requestEndTurn).toHaveBeenCalled();
        expect(mapGameService.switchToMovingStateRoutine).not.toHaveBeenCalled();
    });

    it('should handle end combat and request end turn if active player and combat initiator is not player', () => {
        const mockNewFighters = MOCK_PLAYER_COORDS;
        component.currentMoveBudget = 1;
        component.combatInitiatorId = 'anotherPlayerId';
        gameControllerService.isActivePlayer.and.returnValue(true);
        gameControllerService.playerId = 'testPlayerId';

        component.handleEndCombat(mockNewFighters);

        expect(gameControllerService.requestEndTurn).toHaveBeenCalled();
        expect(mapGameService.switchToMovingStateRoutine).not.toHaveBeenCalled();
    });

    it('should handle end combat and switch to moving state if active player and move budget is not 0 and combat initiator is player', () => {
        const mockNewFighters = MOCK_PLAYER_COORDS;
        component.currentMoveBudget = 1;
        component.combatInitiatorId = 'testPlayerId';
        gameControllerService.isActivePlayer.and.returnValue(true);
        gameControllerService.playerId = 'testPlayerId';

        component.handleEndCombat(mockNewFighters);

        expect(gameControllerService.requestEndTurn).not.toHaveBeenCalled();
        expect(mapGameService.switchToMovingStateRoutine).toHaveBeenCalled();
    });

    it('should handle end combat and reset fighters and combat initiator id', () => {
        const mockNewFighters = MOCK_PLAYER_COORDS;

        component.handleEndCombat(mockNewFighters);

        expect(gameControllerService.resetFighters).toHaveBeenCalled();
        expect(component.combatInitiatorId).toBe('');
    });

    it('should handle end move and call endTurn if hasSlipped is true', () => {
        const mockAvailableMoves = {};
        const mockCurrentMoveBudget = 3;
        spyOn(component, 'endTurn');

        component.handleEndMove(mockAvailableMoves, mockCurrentMoveBudget, true);

        expect(component.currentMoveBudget).toBe(mockCurrentMoveBudget);
        expect(component.endTurn).toHaveBeenCalled();
    });

    it('should handle end move and call endMovement if hasSlipped is false', () => {
        const mockAvailableMoves = {};
        const mockCurrentMoveBudget = 3;
        spyOn(component, 'endMovement');

        component.handleEndMove(mockAvailableMoves, mockCurrentMoveBudget, false);

        expect(component.currentMoveBudget).toBe(mockCurrentMoveBudget);
        expect(component.endMovement).toHaveBeenCalledWith(mockAvailableMoves);
    });

    it('should call endTurn if availableTiles length is 0', () => {
        spyOn(component, 'endTurn');

        component.handleCheckValidAction([]);

        expect(component.endTurn).toHaveBeenCalled();
    });

    it('should set state to MOVING if availableTiles length is greater than 0', () => {
        component.handleCheckValidAction(TEST_AVAILABLE_TILES);

        expect(mapGameService.setState).toHaveBeenCalledWith(GameState.MOVING);
    });

    it('should toggle door if isToggable is true', () => {
        const mockData = { isToggable: true, doorPosition: 1, availableMoves: {} };

        component.handleInteractDoor(mockData.isToggable, mockData.doorPosition, mockData.availableMoves);

        expect(mapGameService.toggleDoor).toHaveBeenCalledWith(mockData.doorPosition);
    });

    it('should not toggle door if isToggable is false', () => {
        const mockData = { isToggable: false, doorPosition: 1, availableMoves: {} };

        component.handleInteractDoor(mockData.isToggable, mockData.doorPosition, mockData.availableMoves);

        expect(mapGameService.toggleDoor).not.toHaveBeenCalled();
    });

    it('should set remainingActions to 0 and call endMovement if active player', () => {
        const mockData = { isToggable: true, doorPosition: 1, availableMoves: {} };
        gameControllerService.isActivePlayer.and.returnValue(true);
        spyOn(component, 'endMovement');

        component.handleInteractDoor(mockData.isToggable, mockData.doorPosition, mockData.availableMoves);

        expect(component.remainingActions).toBe(0);
        expect(component.endMovement).toHaveBeenCalledWith(mockData.availableMoves);
    });

    it('should not set remainingActions to 0 or call endMovement if not active player', () => {
        const mockData = { isToggable: true, doorPosition: 1, availableMoves: {} };
        gameControllerService.isActivePlayer.and.returnValue(false);
        spyOn(component, 'endMovement');

        component.handleInteractDoor(mockData.isToggable, mockData.doorPosition, mockData.availableMoves);

        expect(component.remainingActions).not.toBe(0);
        expect(component.endMovement).not.toHaveBeenCalled();
    });

    it('should handle attacked and update dice results and attack success', () => {
        const mockAttacker = MOCK_PLAYER_COORDS[0];
        const mockDefender = MOCK_PLAYER_COORDS[1];
        const mockAttackerDice = 5;
        const mockDefenderDice = 3;
        const mockIsAttackSuccessful = true;

        component.handleAttacked(mockAttacker, mockAttackerDice, mockDefender, mockDefenderDice, mockIsAttackSuccessful);

        expect(component.attackerDiceResult).toBe(mockAttackerDice);
        expect(component.defenderDiceResult).toBe(mockDefenderDice);
        expect(component.attackSuccessful).toBe(mockIsAttackSuccessful);
        expect(gameControllerService.updatePlayerCoordsList).toHaveBeenCalledWith([mockAttacker, mockDefender]);
    });

    it('should handle attacked and update player coordinates list', () => {
        const mockAttacker = MOCK_PLAYER_COORDS[0];
        const mockDefender = MOCK_PLAYER_COORDS[1];
        const mockAttackerDice = 5;
        const mockDefenderDice = 3;
        const mockIsAttackSuccessful = true;

        component.handleAttacked(mockAttacker, mockAttackerDice, mockDefender, mockDefenderDice, mockIsAttackSuccessful);

        expect(gameControllerService.updatePlayerCoordsList).toHaveBeenCalledWith([mockAttacker, mockDefender]);
    });

    it('should handle killed player and update active fighter and player position', () => {
        const mockKiller = MOCK_PLAYER_COORDS[0];
        const mockKilled = MOCK_PLAYER_COORDS[1];
        const mockKilledOldPosition = 5;

        component.handleKilledPlayer(mockKiller, mockKilled, mockKilledOldPosition);

        expect(gameControllerService.updateActiveFighter).toHaveBeenCalledWith([mockKiller, mockKilled], component.combatInitiatorId);
        expect(mapGameService.changePlayerPosition).toHaveBeenCalledWith(mockKilledOldPosition, mockKilled.position, mockKilled.player);
    });

    it('should set currentMoveBudget to 0 if active player and combat initiator is killed player', () => {
        const mockKiller = MOCK_PLAYER_COORDS[0];
        const mockKilled = MOCK_PLAYER_COORDS[1];
        const mockKilledOldPosition = 5;
        gameControllerService.isActivePlayer.and.returnValue(true);
        component.combatInitiatorId = mockKilled.player.id;

        component.handleKilledPlayer(mockKiller, mockKilled, mockKilledOldPosition);

        expect(component.currentMoveBudget).toBe(0);
    });

    it('should request available moves on budget if active player and combat initiator is killer player', () => {
        const mockKiller = MOCK_PLAYER_COORDS[0];
        const mockKilled = MOCK_PLAYER_COORDS[1];
        const mockKilledOldPosition = 5;
        gameControllerService.isActivePlayer.and.returnValue(true);
        component.combatInitiatorId = mockKiller.player.id;
        component.currentMoveBudget = 3;

        component.handleKilledPlayer(mockKiller, mockKilled, mockKilledOldPosition);

        expect(gameControllerService.requestAvailableMovesOnBudget).toHaveBeenCalledWith(component.currentMoveBudget);
    });

    it('should not request available moves on budget if currentMoveBudget is "--"', () => {
        const mockKiller = MOCK_PLAYER_COORDS[0];
        const mockKilled = MOCK_PLAYER_COORDS[1];
        const mockKilledOldPosition = 5;
        gameControllerService.isActivePlayer.and.returnValue(true);
        component.combatInitiatorId = mockKiller.player.id;
        component.currentMoveBudget = '--';

        component.handleKilledPlayer(mockKiller, mockKilled, mockKilledOldPosition);

        expect(gameControllerService.requestAvailableMovesOnBudget).not.toHaveBeenCalled();
    });

    it('should not set currentMoveBudget to 0 or request available moves on budget if not active player', () => {
        const mockKiller = MOCK_PLAYER_COORDS[0];
        const mockKilled = MOCK_PLAYER_COORDS[1];
        const mockKilledOldPosition = 5;
        gameControllerService.isActivePlayer.and.returnValue(false);

        component.handleKilledPlayer(mockKiller, mockKilled, mockKilledOldPosition);

        expect(component.currentMoveBudget).not.toBe(0);
        expect(gameControllerService.requestAvailableMovesOnBudget).not.toHaveBeenCalled();
    });

    it('should handle escaped and set active player if hasEscaped is true', () => {
        const mockRemainingEscapeChances = 1;
        const mockHasEscaped = true;
        component.combatInitiatorId = 'testInitiator';

        component.handleEscaped(mockRemainingEscapeChances, mockHasEscaped);

        expect(gameControllerService.setActivePlayer).toHaveBeenCalledWith('testInitiator');
        expect(component.remainingEscapeChances).toBe('--');
    });

    it('should handle escaped and update remainingEscapeChances if hasEscaped is false and active player', () => {
        const mockRemainingEscapeChances = 1;
        const mockHasEscaped = false;
        gameControllerService.isActivePlayer.and.returnValue(true);

        component.handleEscaped(mockRemainingEscapeChances, mockHasEscaped);

        expect(component.remainingEscapeChances).toBe(mockRemainingEscapeChances);
    });

    it('should handle escaped and not update remainingEscapeChances if hasEscaped is false and not active player', () => {
        const mockRemainingEscapeChances = 1;
        const mockHasEscaped = false;
        gameControllerService.isActivePlayer.and.returnValue(false);

        component.handleEscaped(mockRemainingEscapeChances, mockHasEscaped);

        expect(component.remainingEscapeChances).not.toBe(mockRemainingEscapeChances);
    });

    it('should redirect last man standing', () => {
        component.redirectLastManStanding();

        expect(router.navigate).toHaveBeenCalledWith(['/home']);
        expect(snackbar.open).toHaveBeenCalledWith('Tous les autres joueurs ont quitté la partie', 'Fermer', jasmine.any(Object));
    });

    it('should redirect end game and navigate to home after delay', () => {
        const mockEndGameMessage = 'Game Over';

        component.redirectEndGame(mockEndGameMessage);
        expect(snackbar.open).toHaveBeenCalledWith(mockEndGameMessage, 'Fermer', jasmine.any(Object));
        expect(router.navigate).not.toHaveBeenCalled();
        setTimeout(() => {
            expect(router.navigate).toHaveBeenCalledWith(['/home']);
        }, ENDGAME_DELAY * 2);
    });

    it('should call resetPlayerView and requestEndTurn if active player', () => {
        gameControllerService.isActivePlayer.and.returnValue(true);
        spyOn(component, 'resetPlayerView');

        component.endTurn();

        expect(component.resetPlayerView).toHaveBeenCalled();
        expect(gameControllerService.requestEndTurn).toHaveBeenCalled();
    });

    it('should not call resetPlayerView or requestEndTurn if not active player', () => {
        gameControllerService.isActivePlayer.and.returnValue(false);
        spyOn(component, 'resetPlayerView');

        component.endTurn();

        expect(component.resetPlayerView).not.toHaveBeenCalled();
        expect(gameControllerService.requestEndTurn).not.toHaveBeenCalled();
    });

    it('should update player position if playerCoord is found', () => {
        const mockPlayerId = 'testPlayerId';
        const mockNewPlayerPosition = 5;
        const mockPlayerCoord = MOCK_PLAYER_COORD;
        gameControllerService.findPlayerCoordById.and.returnValue(mockPlayerCoord);

        component.updatePlayerPosition(mockPlayerId, mockNewPlayerPosition);
        expect(mockPlayerCoord.position).toBe(mockNewPlayerPosition);
        mockPlayerCoord.position = 1;
        expect(mapGameService.changePlayerPosition).toHaveBeenCalledWith(mockPlayerCoord.position, mockNewPlayerPosition, mockPlayerCoord.player);
    });

    it('should not update player position if playerCoord is not found', () => {
        const mockPlayerId = 'testPlayerId';
        const mockNewPlayerPosition = 5;
        gameControllerService.findPlayerCoordById.and.returnValue(undefined);

        component.updatePlayerPosition(mockPlayerId, mockNewPlayerPosition);

        expect(mapGameService.changePlayerPosition).not.toHaveBeenCalled();
    });

    it('should switch to moving state routine if shortestPathByTile is not empty', () => {
        component.endMovement(TEST_SHORTEST_PATH);

        expect(mapGameService.switchToMovingStateRoutine).toHaveBeenCalledWith(TEST_SHORTEST_PATH);
    });

    it('should request check action if shortestPathByTile is empty and remainingActions is greater than 0', () => {
        const mockShortestPathByTile = {};
        component.remainingActions = 1;

        component.endMovement(mockShortestPathByTile);

        expect(gameControllerService.requestCheckAction).toHaveBeenCalled();
    });

    it('should reset movement previsualization and end turn if shortestPathByTile is empty and remainingActions is 0', () => {
        const mockShortestPathByTile = {};
        component.remainingActions = 0;
        spyOn(component, 'endTurn');

        component.endMovement(mockShortestPathByTile);

        expect(mapGameService.resetMovementPrevisualization).toHaveBeenCalled();
        expect(component.endTurn).toHaveBeenCalled();
    });

    it('should reset movement previsualization and end turn if shortestPathByTile is empty and remainingActions is "--"', () => {
        const mockShortestPathByTile = {};
        component.remainingActions = '--';
        spyOn(component, 'endTurn');

        component.endMovement(mockShortestPathByTile);

        expect(mapGameService.resetMovementPrevisualization).toHaveBeenCalled();
        expect(component.endTurn).toHaveBeenCalled();
    });

    it('should call requestStartAction if remainingActions is 1 and currentStateNumber is MOVING', () => {
        component.remainingActions = 1;
        mapGameService.currentStateNumber = GameState.MOVING;

        component.startAction();

        expect(gameControllerService.requestStartAction).toHaveBeenCalled();
    });

    it('should not call requestStartAction if remainingActions is not 1', () => {
        component.remainingActions = 0;
        mapGameService.currentStateNumber = GameState.MOVING;

        component.startAction();

        expect(gameControllerService.requestStartAction).not.toHaveBeenCalled();
    });

    it('should not call requestStartAction if currentStateNumber is not MOVING', () => {
        component.remainingActions = 1;
        mapGameService.currentStateNumber = GameState.NOTPLAYING;

        component.startAction();

        expect(gameControllerService.requestStartAction).not.toHaveBeenCalled();
    });

    it('should request combat action if active player', () => {
        const mockCombatAction = 'attack';
        gameControllerService.isActivePlayer.and.returnValue(true);

        component.catchSelectCombatAction(mockCombatAction);

        expect(gameControllerService.requestCombatAction).toHaveBeenCalledWith(mockCombatAction);
    });

    it('should not request combat action if not active player', () => {
        const mockCombatAction = 'attack';
        gameControllerService.isActivePlayer.and.returnValue(false);

        component.catchSelectCombatAction(mockCombatAction);

        expect(gameControllerService.requestCombatAction).not.toHaveBeenCalled();
    });

    it('should reset player view', () => {
        component.resetPlayerView();

        expect(mapGameService.resetPlayerView).toHaveBeenCalled();
        expect(component.currentMoveBudget).toBe('--');
        expect(component.remainingActions).toBe('--');
    });

    it('should navigate to home when quitGame is called', () => {
        component.quitGame();
        expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should call mapService.resetMap and socketService.disconnect on destroy', () => {
        component.ngOnDestroy();

        expect(mapGameService.resetMap).toHaveBeenCalled();
        expect(socketService.disconnect).toHaveBeenCalled();
    });
});
