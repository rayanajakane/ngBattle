import { TestBed } from '@angular/core/testing';
import { GameState, GameTile, TilePreview } from '@common/game-structure';
import { Player, PlayerAttribute } from '@common/player';
import { ItemTypes, TileTypes } from '@common/tile-types';
import { ActionStateService } from './action-state.service';
import { CombatStateService } from './combat-state.service';
import { MapGameService } from './map-game.service';
import { MovingStateService } from './moving-state.service';
import { NotPlayingStateService } from './not-playing-state.service';

const player1: Player = {
    id: '1',
    name: 'player1',
    isAdmin: false,
    avatar: '1',
    attributes: {} as PlayerAttribute,
    isActive: false,
    abandoned: true,
    wins: 0,
};

/* eslint-disable */ // Magic numbers are used for testing purposes
// const shortestPathIndexes1 = [0, 1, 2];
// const shortestPathIndexes2 = [4, 5, 6];
const availableTiles = [1, 2, 3, 4, 5];
// const availableTiles2 = [0, 1, 2];

/* eslint-enable */

const notPlayingStateServiceSpy = jasmine.createSpyObj('NotPlayingStateService', [
    'onMouseDown',
    'onMouseEnter',
    'onMouseUp',
    'onRightClick',
    'onExit',
    'onDrop',
    'resetMovementPrevisualization',
    'initializePrevisualization',
    'setAvailableTiles',
    'getShortestPathByTile',
]);
const movingStateServiceSpy = jasmine.createSpyObj('MovingStateService', [
    'onMouseDown',
    'onMouseEnter',
    'onMouseUp',
    'onRightClick',
    'onExit',
    'onDrop',
    'resetMovementPrevisualization',
    'initializePrevisualization',
    'setAvailableTiles',
    'getShortestPathByTile',
    'getShortestPathByIndex',
    'getAvailableTiles',
]);
const actionStateServiceSpy = jasmine.createSpyObj('ActionStateService', [
    'onMouseDown',
    'onMouseEnter',
    'onMouseUp',
    'onRightClick',
    'onExit',
    'onDrop',
    'resetMovementPrevisualization',
    'initializePrevisualization',
    'setAvailableTiles',
    'getShortestPathByTile',
]);
const combatStateServiceSpy = jasmine.createSpyObj('CombatStateService', [
    'onMouseDown',
    'onMouseEnter',
    'onMouseUp',
    'onRightClick',
    'onExit',
    'onDrop',
    'resetMovementPrevisualization',
    'initializePrevisualization',
    'setAvailableTiles',
    'getShortestPathByTile',
]);

describe('MapGameService', () => {
    let service: MapGameService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: NotPlayingStateService, useValue: notPlayingStateServiceSpy },
                { provide: MovingStateService, useValue: movingStateServiceSpy },
                { provide: ActionStateService, useValue: actionStateServiceSpy },
                { provide: CombatStateService, useValue: combatStateServiceSpy },
            ],
        });
        service = TestBed.inject(MapGameService);
        service.tiles = [
            {
                player: player1,
                isAccessible: TilePreview.NONE,
                idx: 0,
                tileType: '',
                item: '',
                hasPlayer: false,
            },
            {
                player: player1,
                isAccessible: TilePreview.NONE,
                idx: 1,
                tileType: '',
                item: '',
                hasPlayer: false,
            },
            {
                player: player1,
                isAccessible: TilePreview.NONE,
                idx: 2,
                tileType: '',
                item: '',
                hasPlayer: false,
            },
        ];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set the state correctly', () => {
        service.setState(GameState.MOVING);
        expect(service.currentStateNumber).toBe(GameState.MOVING);
        expect(service['currentState']).toBe(movingStateServiceSpy);

        service.setState(GameState.ACTION);
        expect(service.currentStateNumber).toBe(GameState.ACTION);
        expect(service['currentState']).toBe(actionStateServiceSpy);

        service.setState(GameState.COMBAT);
        expect(service.currentStateNumber).toBe(GameState.COMBAT);
        expect(service['currentState']).toBe(combatStateServiceSpy);

        service.setState(GameState.NOTPLAYING);
        expect(service.currentStateNumber).toBe(GameState.NOTPLAYING);
        expect(service['currentState']).toBe(notPlayingStateServiceSpy);
    });

    it('should set tiles correctly', () => {
        const tiles: GameTile[] = [
            { player: player1, isAccessible: TilePreview.NONE, idx: 0, tileType: '', item: '', hasPlayer: false },
            { player: player1, isAccessible: TilePreview.NONE, idx: 1, tileType: '', item: '', hasPlayer: false },
        ];
        service.setTiles(tiles);
        expect(service.tiles).toEqual(tiles);
    });

    it('should handle onMouseUp correctly', () => {
        const event = new MouseEvent('mouseup');
        spyOn(event, 'preventDefault');
        service.onMouseUp(0, event);
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should handle onRightClick correctly', () => {
        service.onRightClick(0);
        expect(notPlayingStateServiceSpy.onRightClick).toHaveBeenCalledWith(service.tiles[0]);
    });

    it('should handle onMouseDown correctly', () => {
        const event = new MouseEvent('mousedown', { button: 0 });
        spyOn(event, 'preventDefault');
        service.onMouseDown(0, event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(notPlayingStateServiceSpy.onMouseDown).toHaveBeenCalledWith(0);
    });

    it('should handle onMouseEnter correctly', () => {
        const event = new MouseEvent('mouseenter');
        spyOn(event, 'preventDefault');
        spyOn(service, 'renderAvailableTiles');
        spyOn(service, 'renderPathToTarget');
        service.onMouseEnter(0, event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(service.renderAvailableTiles).toHaveBeenCalled();
        expect(service.renderPathToTarget).toHaveBeenCalledWith(0);
    });

    it('should switch to not playing state routine correctly', () => {
        spyOn(service, 'removeAllPreview');
        service.switchToNotPlayingStateRoutine();
        expect(service.removeAllPreview).toHaveBeenCalled();
        expect(service.currentStateNumber).toBe(GameState.NOTPLAYING);
    });

    it('should switch to moving state routine correctly', () => {
        spyOn(service, 'removeAllPreview');
        spyOn(service, 'initializePrevisualization');
        service.switchToMovingStateRoutine();
        expect(service.removeAllPreview).toHaveBeenCalled();
        expect(service.currentStateNumber).toBe(GameState.MOVING);
        expect(service.initializePrevisualization).toHaveBeenCalled();
    });

    it('should switch to action state routine correctly', () => {
        spyOn(service, 'removeAllPreview');
        spyOn(service, 'initializePrevisualization');
        service.switchToActionStateRoutine(availableTiles);
        expect(service.removeAllPreview).toHaveBeenCalled();
        expect(service.currentStateNumber).toBe(GameState.ACTION);
        expect(service.initializePrevisualization).toHaveBeenCalledWith(availableTiles);
    });

    it('should reset map correctly', () => {
        spyOn(service, 'resetMovementPrevisualization');
        spyOn(service, 'removeAllPreview');
        service.resetMap();
        expect(service.resetMovementPrevisualization).toHaveBeenCalled();
        expect(service.removeAllPreview).toHaveBeenCalled();
    });

    it('should render preview correctly', () => {
        service.renderPreview([0, 1], TilePreview.PREVIEW);
        expect(service.tiles[0].isAccessible).toBe(TilePreview.PREVIEW);
        expect(service.tiles[1].isAccessible).toBe(TilePreview.PREVIEW);
    });

    it('should render available tiles correctly', () => {
        service['currentState'] = movingStateServiceSpy;
        movingStateServiceSpy.getAvailableTiles.and.returnValue([0, 1]);
        service.renderAvailableTiles();
        expect(service.tiles[0].isAccessible).toBe(TilePreview.PREVIEW);
        expect(service.tiles[1].isAccessible).toBe(TilePreview.PREVIEW);
    });

    it('should render path to target correctly', () => {
        service['currentState'] = movingStateServiceSpy;
        movingStateServiceSpy.getShortestPathByIndex.and.returnValue([0, 1]);
        service.renderPathToTarget(1);
        expect(service.tiles[0].isAccessible).toBe(TilePreview.SHORTESTPATH);
        expect(service.tiles[1].isAccessible).toBe(TilePreview.SHORTESTPATH);
    });

    it('should remove all preview correctly', () => {
        service.removeAllPreview();
        service.tiles.forEach((tile) => {
            expect(tile.isAccessible).toBe(TilePreview.NONE);
        });
    });

    it('should initialize previsualization correctly', () => {
        spyOn(service, 'renderAvailableTiles');
        service.initializePrevisualization(availableTiles);
        expect(service.renderAvailableTiles).toHaveBeenCalled();
    });

    it('should reset movement previsualization correctly', () => {
        service.resetMovementPrevisualization();
        expect(notPlayingStateServiceSpy.resetMovementPrevisualization).toHaveBeenCalled();
    });

    it('should set available tiles correctly', () => {
        service.setAvailableTiles(availableTiles);
        expect(notPlayingStateServiceSpy.setAvailableTiles).toHaveBeenCalledWith(availableTiles);
    });

    it('should place player correctly', () => {
        service.placePlayer(0, player1);
        expect(service.tiles[0].player).toBe(player1);
        expect(service.tiles[0].hasPlayer).toBe(true);
    });

    it('should remove player by id correctly', () => {
        spyOn(service, 'removePlayer');
        service.removePlayerById('1');
        expect(service.removePlayer).toHaveBeenCalledWith(0);
    });

    it('should remove player correctly', () => {
        service.removePlayer(0);
        expect(service.tiles[0].player).toBeUndefined();
        expect(service.tiles[0].hasPlayer).toBe(false);
    });

    it('should change player position correctly', () => {
        spyOn(service, 'removePlayer');
        spyOn(service, 'placePlayer');
        service.changePlayerPosition(0, 1, player1);
        expect(service.removePlayer).toHaveBeenCalledWith(0);
        expect(service.placePlayer).toHaveBeenCalledWith(1, player1);
    });

    it('should remove unused starting points correctly', () => {
        service.tiles[0].item = ItemTypes.STARTINGPOINT;
        service.tiles[0].hasPlayer = false;
        service.removeUnusedStartingPoints();
        expect(service.tiles[0].item).toBe('');
    });

    it('should toggle door correctly', () => {
        service.tiles[0].tileType = TileTypes.DOORCLOSED;
        service.toggleDoor(0);
        expect(service.tiles[0].tileType).toBe(TileTypes.DOOROPEN);

        service.toggleDoor(0);
        expect(service.tiles[0].tileType).toBe(TileTypes.DOORCLOSED);
    });

    it('should check if target is available correctly', () => {
        spyOn(service, 'checkIfDoorOrPlayer').and.returnValue(true);
        expect(service.checkIfTargetAvailable(0, 3)).toBe(true);
    });

    it('should check if door or player correctly', () => {
        service.tiles[0].hasPlayer = true;
        expect(service.checkIfDoorOrPlayer(0)).toBe(true);

        service.tiles[0].hasPlayer = false;
        service.tiles[0].tileType = TileTypes.DOORCLOSED;
        expect(service.checkIfDoorOrPlayer(0)).toBe(true);

        service.tiles[0].tileType = TileTypes.DOOROPEN;
        expect(service.checkIfDoorOrPlayer(0)).toBe(true);

        service.tiles[0].tileType = '';
        expect(service.checkIfDoorOrPlayer(0)).toBe(false);
    });
});
