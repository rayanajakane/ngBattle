import { Injectable } from '@angular/core';
import { TileJson } from '@app/data-structure/game-structure';

@Injectable({
    providedIn: 'root',
})
export abstract class MapBaseService {
    tiles: TileJson[];
    getMapTiles(): TileJson[] {
        return this.tiles;
    }
    abstract handleMapClick(event: MouseEvent): void;
}
