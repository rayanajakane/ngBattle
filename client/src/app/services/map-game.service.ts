import { Injectable } from '@angular/core';
import { GameTile } from '../data-structure/game-structure';
import { MapBaseService } from './map-base.service';

@Injectable({
    providedIn: 'root',
})
export class MapGameService extends MapBaseService {
    tiles: GameTile[];

    onRightClick(index: number): void {}
    onMouseDown(index: number, event: MouseEvent): void {}
    onMouseUp(index: number, event: MouseEvent): void {}
    onDrop(index: number): void {}
    onMouseEnter(index: number, event: MouseEvent): void {}
    onExit(): void {}
}
