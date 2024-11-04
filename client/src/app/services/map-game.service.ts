import { Injectable } from '@angular/core';
import { GameTile, TilePreview } from '../data-structure/game-structure';
import { MapBaseService } from './map-base.service';

@Injectable({
    providedIn: 'root',
})
export class MapGameService extends MapBaseService {
    tiles: GameTile[];
    accessibleTiles: number[] = [];
    shortestPathByTile: { [key: number]: number[] } = {};

    constructor() {
        super();
        this.fetchAccessibleTiles();
        this.fetchShortestPath();
    }

    onRightClick(index: number): void {}
    onMouseDown(index: number, event: MouseEvent): void {}
    onMouseUp(index: number, event: MouseEvent): void {}
    onDrop(index: number): void {}
    onMouseEnter(index: number, event: MouseEvent): void {
        this.setAccessibleTiles();
        this.setShortestPath(index);
    }
    onExit(): void {
        this.removeAllPreview();
    }

    setPreview(indexes: number[], previewType: TilePreview): void {
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
        this.accessibleTiles = Array.from({ length: 51 }, (_, i) => i);
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

    setShortestPath(index: number): void {
        if (this.shortestPathByTile[index]) {
            this.setPreview(this.shortestPathByTile[index], TilePreview.SHORTESTPATH);
        }
    }

    setAccessibleTiles(): void {
        this.setPreview(this.accessibleTiles, TilePreview.PREVIEW);
    }
}
