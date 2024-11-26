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

    currentStateNumber: GameState;
    private currentState: BaseStateService;

    constructor(
        private notPlaying: NotPlayingStateService,
        private moving: MovingStateService,
        private action: ActionStateService,
        private combat: CombatStateService,
    ) {
        super();
        this.setState(GameState.NOTPLAYING);
    }

    setState(state: GameState): void {
        this.currentStateNumber = state;
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

    onRightClick(index: number): void {
        this.currentState.onRightClick(this.tiles[index]);
    }

    onMouseDown(index: number, event: MouseEvent): void {
        event.preventDefault();
        if (event.button === 0) {
            const nextState = this.currentState.onMouseDown(index);
            if (nextState !== this.currentStateNumber) {
                if (nextState === GameState.NOTPLAYING) {
                    this.switchToNotPlayingStateRoutine();
                } else if (nextState === GameState.MOVING) {
                    this.switchToMovingStateRoutine();
                }
            }
        }
    }

    onMouseEnter(index: number, event: MouseEvent): void {
        event.preventDefault();
        this.renderAvailableTiles();
        this.renderPathToTarget(index);
    }

    switchToNotPlayingStateRoutine(): void {
        this.removeAllPreview();
        this.setState(GameState.NOTPLAYING);
    }

    switchToMovingStateRoutine(shortestPathByTile?: ShortestPathByTile): void {
        this.removeAllPreview();
        this.setState(GameState.MOVING);
        if (!shortestPathByTile) {
            // if no parameter is given, reuse old shortestPathByTile
            shortestPathByTile = this.currentState.getShortestPathByTile();
        }
        this.initializePrevisualization(shortestPathByTile);
    }

    switchToActionStateRoutine(availableTiles: number[]): void {
        this.removeAllPreview();
        this.setState(GameState.ACTION);
        this.initializePrevisualization(availableTiles);
    }

    resetMap() {
        this.resetAllMovementPrevisualization();
        this.removeAllPreview();
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

    initializePrevisualization(accessibleTiles: ShortestPathByTile | number[]) {
        this.currentState.initializePrevisualization(accessibleTiles);
        this.renderAvailableTiles();
    }

    resetMovementPrevisualization() {
        this.currentState.resetMovementPrevisualization();
    }

    resetAllMovementPrevisualization() {
        this.notPlaying.resetMovementPrevisualization();
        this.moving.resetMovementPrevisualization();
        this.action.resetMovementPrevisualization();
        this.combat.resetMovementPrevisualization();
    }

    placePlayer(index: number, player: Player): void {
        this.tiles[index].player = player;
        this.tiles[index].hasPlayer = true;
    }

    removePlayerById(playerId: string): void {
        const index = this.tiles.findIndex((tile) => tile.player?.id === playerId);
        if (index !== -1) {
            this.removePlayer(index);
        }
    }

    removePlayer(index: number): void {
        this.tiles[index].player = undefined;
        this.tiles[index].hasPlayer = false;
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
