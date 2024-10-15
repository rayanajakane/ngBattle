import { Injectable } from '@angular/core';
import { TileJson } from '@app/data-structure/game-structure';

@Injectable({
    providedIn: 'root',
})
export abstract class MapBaseService {
    tiles: TileJson[];

    abstract onRightClick(index: number): void;
    abstract onMouseDown(index: number, event: MouseEvent): void;
    abstract onMouseUp(index: number, event: MouseEvent): void;
    abstract onDrop(index: number): void;
    abstract onMouseEnter(index: number, event: MouseEvent): void;
    abstract onExit(): void;
}
