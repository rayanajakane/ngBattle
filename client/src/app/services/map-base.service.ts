import { Injectable } from '@angular/core';
import { GameTile, TileStructure } from '@common/game-structure';

@Injectable({
    providedIn: 'root',
})
export abstract class MapBaseService {
    tiles: TileStructure[];

    isGameTile(tile: TileStructure | GameTile): tile is GameTile {
        return (tile as GameTile).isAccessible !== undefined;
    }

    isPlayerTile(tile: TileStructure | GameTile): tile is GameTile & { player: { avatar: string } } {
        return (tile as GameTile).player !== undefined;
    }

    abstract onRightClick(index: number): void;
    abstract onMouseDown(index: number, event: MouseEvent): void;
    abstract onMouseUp(index: number, event: MouseEvent): void;
    abstract onDrop(index: number): void;
    abstract onMouseEnter(index: number, event: MouseEvent): void;
    abstract onExit(): void;
}
