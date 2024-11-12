import { Injectable } from '@angular/core';
import { ShortestPathByTile } from '@app/pages/game-page/game-page.component';
import { GameState, GameTile, TilePreview } from '@common/game-structure';
import { Player } from '@common/player';
import { ItemTypes, TileTypes } from '@common/tile-types';
import { ActionStateService } from './action-state.service';
import { BaseStateService } from './base-state.service';
import { CombatStateService } from './combat-state.service';
import { MapBaseService } from './map-base.service';
import { MovingStateService } from './moving-state.service';
import { NotPlayingStateService } from './not-playing-state.service';

@Injectable({
    providedIn: 'root',
})
export class MapGameService extends MapBaseService {
    tiles: GameTile[];
    availableTiles: number[] = [];
    shortestPathByTile: { [key: number]: number[] } = {};
    isMoving: boolean = false;
    actionDoor: boolean = false;

    private currentState: BaseStateService;

    // private eventSubject = new Subject<number>();

    /* eslint-disable */ // Methods to be implemented in the next sprint
    // event$ = this.eventSubject.asObservable();

    constructor(
        private notPlaying: NotPlayingStateService,
        private moving: MovingStateService,
        private action: ActionStateService,
        private combat: CombatStateService,
    ) {
        super();
        this.currentState = this.notPlaying;
    }

    setState(state: GameState): void {
        switch (state) {
            case GameState.MOVING:
                this.currentState = this.moving;
                break;
            case GameState.ACTION:
                this.currentState = this.action;
                break;
            case GameState.COMBAT:
                this.currentState = this.combat;
                break;
            default:
                this.currentState = this.notPlaying;
        }
    }

    setTiles(tiles: GameTile[]): void {
        this.tiles = tiles;
    }

    setShortestPathByTile(shortestPathByTile: ShortestPathByTile): void {
        this.shortestPathByTile = shortestPathByTile;
    }

    onMouseUp(index: number, event: MouseEvent): void {
        event.preventDefault();
    }
    onRightClick(index: number): void {
        this.currentState.onRightClick(index);
    }
    onExit(): void {}
    onDrop(index: number): void {}

    onMouseDown(index: number, event: MouseEvent): void {
        event.preventDefault();
        if (event.button === 0) {
            this.currentState.onMouseDown(index);
        }
    }

    onMouseEnter(index: number, event: MouseEvent): void {
        event.preventDefault();
        this.renderAvailableTiles();
        this.renderPathToTarget(index);
    }

    renderPreview(indexes: number[], previewType: TilePreview): void {
        indexes.forEach((index) => {
            this.tiles[index].isAccessible = previewType;
        });
    }

    renderAvailableTiles(): void {
        const tiles = this.currentState.getAvailableTiles();
        if (tiles.length > 0) {
            this.renderPreview(tiles, TilePreview.PREVIEW);
        }
    }

    renderPathToTarget(index: number): void {
        const shortestPath = this.currentState.getShortestPathByIndex(index);
        if (shortestPath) {
            this.renderPreview(shortestPath, TilePreview.SHORTESTPATH);
        } else if (this.currentState.availablesTilesIncludes(index)) {
            this.tiles[index].isAccessible = TilePreview.SHORTESTPATH;
        }
    }

    removeAllPreview(): void {
        this.tiles.forEach((tile) => {
            tile.isAccessible = TilePreview.NONE;
        });
    }

    resetShortestPath(): void {
        this.shortestPathByTile = {};
    }

    resetMovementPrevisualization() {
        this.currentState.setAvailableTiles([]);
        this.setShortestPathByTile({});
    }

    setAvailableTiles(availableTiles: number[]): void {
        this.currentState.setAvailableTiles(availableTiles);
    }

    placePlayer(index: number, player: Player): void {
        this.tiles[index].player = player;
        this.tiles[index].hasPlayer = true;
    }

    removePlayer(index: number): void {
        this.tiles[index].player = undefined;
        this.tiles[index].hasPlayer = false;
    }

    findPlayerIndex(player: Player): number {
        return this.tiles.findIndex((tile) => tile.player?.id === player.id);
    }

    changePlayerPosition(oldIndex: number, newIndex: number, player: Player): void {
        this.removePlayer(oldIndex);
        this.placePlayer(newIndex, player);
    }

    removeUnusedStartingPoints(): void {
        this.tiles.forEach((tile) => {
            if (tile.item === ItemTypes.STARTINGPOINT && !tile.hasPlayer) {
                tile.item = '';
            }
        });
    }

    toggleDoor(index: number): void {
        if (this.tiles[index].tileType === TileTypes.DOORCLOSED) {
            this.tiles[index].tileType = TileTypes.DOOROPEN;
        } else if (this.tiles[index].tileType === TileTypes.DOOROPEN) {
            this.tiles[index].tileType = TileTypes.DOORCLOSED;
        }
    }

    initializePrevisualization(accessibleTiles: ShortestPathByTile | number[]) {
        this.currentState.initializePrevizualisation(accessibleTiles);
        this.renderAvailableTiles();
    }

    // checkIfTileIsDoor(index: number): boolean {
    //     return this.tiles[index].tileType === TileTypes.DOORCLOSED || this.tiles[index].tileType === TileTypes.DOOROPEN;
    // }
}
