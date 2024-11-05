import { Injectable } from '@angular/core';
import { GameTile, TilePreview } from '@app/data-structure/game-structure';
import { Player, PlayerAttribute } from '@app/interfaces/player';
import { ShortestPathByTile } from '@app/pages/game-page/game-page.component';
import { Subject } from 'rxjs';
import { MapBaseService } from './map-base.service';

const player1: Player = {
    id: '1',
    name: 'player1',
    isAdmin: false,
    avatar: '1',
    attributes: {} as PlayerAttribute,
    isActive: false,
    abandoned: true,
};

@Injectable({
    providedIn: 'root',
})
// Temporary disabled linting rule
export class MapGameService extends MapBaseService {
    /* eslint-disable */
    tiles: GameTile[];
    availableTiles: number[] = [];
    shortestPathByTile: { [key: number]: number[] } = {};
    isMoving: boolean = false;

    private eventSubject = new Subject<number>();
    event$ = this.eventSubject.asObservable();
    emitEvent(value: number) {
        this.eventSubject.next(value);
    }

    constructor() {
        super();
        this.fetchAccessibleTiles();
        this.fetchShortestPath();

        //temp function to test player placement
        setTimeout(() => {
            //temp function to test player placement
            this.placePlayer(1, player1);
        }, 1000);
    }

    setAvailableTiles(availableTiles: number[]): void {
        this.availableTiles = availableTiles;
    }

    setShortestPathByTile(shortestPathByTile: ShortestPathByTile): void {
        this.shortestPathByTile = shortestPathByTile;
    }

    onRightClick(index: number): void {
        this.changePlayerPosition(index, player1);
    }
    onMouseDown(index: number, event: MouseEvent): void {
        if (event.button === 0) {
            if (this.availableTiles.includes(index) && !this.isMoving) {
                this.emitEvent(index);
                this.isMoving = true;
            }
        }
    }

    onMouseUp(index: number, event: MouseEvent): void {}

    onDrop(index: number): void {}
    onMouseEnter(index: number, event: MouseEvent): void {
        this.renderShortestPath(index);
    }

    onExit(): void {}

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

    //temp function to test accessible tiles
    fetchAccessibleTiles(): void {
        this.availableTiles = Array.from({ length: 51 }, (_, i) => i);
    }

    //temp function to test shortest path
    fetchShortestPath(): void {
        this.shortestPathByTile[1] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.shortestPathByTile[2] = [10, 11, 12, 13, 14, 15, 16, 17, 18];
        this.shortestPathByTile[3] = [19, 20, 21, 22, 23, 24, 25, 26, 27];
    }

    resetShortestPath(): void {
        this.shortestPathByTile = {};
    }

    renderShortestPath(index: number): void {
        if (this.shortestPathByTile[index]) {
            this.renderPreview(this.shortestPathByTile[index], TilePreview.SHORTESTPATH);
        }
    }

    renderAvailableTiles(): void {
        this.renderPreview(this.availableTiles, TilePreview.PREVIEW);
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

    changePlayerPosition(newIndex: number, player: Player): void {
        this.removePlayer(this.findPlayerIndex(player));
        this.placePlayer(newIndex, player);
    }
    /* eslint-enable */
}
