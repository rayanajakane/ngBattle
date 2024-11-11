import { Injectable } from '@angular/core';
import { State } from '@app/interfaces/state';
import { ShortestPathByTile } from '@app/pages/game-page/game-page.component';
import { GameState, GameTile, TilePreview } from '@common/game-structure';
import { Player } from '@common/player';
import { ItemTypes, TileTypes } from '@common/tile-types';
import { Subject } from 'rxjs';
import { ActionStateService } from './action-state.service';
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

    private currentState: State;

    private eventSubject = new Subject<number>();

    /* eslint-disable */ // Methods to be implemented in the next sprint
    event$ = this.eventSubject.asObservable();

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

    onMouseUp(index: number, event: MouseEvent): void {
        event.preventDefault();
    }
    onRightClick(index: number): void {
        this.currentState.onRightClick(index);
    }
    onExit(): void {}
    onDrop(index: number): void {}
    /* eslint-enable */

    emitEvent(value: number) {
        this.eventSubject.next(value);
    }

    setAvailableTiles(availableTiles: number[]): void {
        this.availableTiles = availableTiles;
    }

    setShortestPathByTile(shortestPathByTile: ShortestPathByTile): void {
        this.shortestPathByTile = shortestPathByTile;
    }

    onMouseDown(index: number, event: MouseEvent): void {
        if (event.button === 0 && !this.isMoving && !this.actionDoor) {
            if (this.availableTiles.includes(index)) {
                this.isMoving = true;
                this.emitEvent(index);
            } else if (this.checkIfTileIsDoor(index)) {
                this.actionDoor = true;
                this.emitEvent(index);
            }
        }
    }

    onMouseEnter(index: number, event: MouseEvent): void {
        event.preventDefault();
        this.renderShortestPath(index);
    }

    checkIfTileIsDoor(index: number): boolean {
        return this.tiles[index].tileType === TileTypes.DOORCLOSED || this.tiles[index].tileType === TileTypes.DOOROPEN;
    }

    renderPreview(indexes: number[], previewType: TilePreview): void {
        indexes.forEach((index) => {
            this.tiles[index].isAccessible = previewType;
        });
    }

    removeAllPreview(): void {
        this.tiles.forEach((tile) => {
            tile.isAccessible = TilePreview.NONE;
        });
    }
    resetShortestPath(): void {
        this.shortestPathByTile = {};
    }

    renderShortestPath(index: number): void {
        this.renderAvailableTiles();
        if (this.shortestPathByTile[index]) {
            this.renderPreview(this.shortestPathByTile[index], TilePreview.SHORTESTPATH);
        }
    }

    renderAvailableTiles(): void {
        if (this.availableTiles.length > 0) {
            this.renderPreview(this.availableTiles, TilePreview.PREVIEW);
        }
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
}
