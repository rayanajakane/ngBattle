import { Injectable } from '@angular/core';
import { TileJson } from '@app/data-structure/game-structure';
import { TileTypes } from '@app/data-structure/toolType';

export const DEFAULT_MAP_SIZE = 10;

@Injectable({
    providedIn: 'root',
})
export class MapService {
    // Optionally put a map if we import a map
    createGrid(mapSize?: number, tiles?: TileJson[]): TileJson[] {
        if (mapSize !== undefined && mapSize <= 0) {
            throw new Error('MapSize must be a positive number.');
        }
        const arraySize = mapSize ? mapSize : DEFAULT_MAP_SIZE;
        return tiles
            ? tiles
            : Array(arraySize * arraySize)
                  .fill(0)
                  .map((_, index) => {
                      // Assign a unique id based on the index
                      return {
                          idx: index, // Unique ID for each tile
                          tileType: TileTypes.BASIC, // Tile type
                          item: '',
                          hasPlayer: false,
                      };
                  });
    }
    chooseTileType(currentTileType: string, newTileType: string): string {
        if (newTileType === TileTypes.DOOR) {
            if (currentTileType === TileTypes.DOORCLOSED) {
                newTileType = TileTypes.DOOROPEN;
            } else {
                newTileType = TileTypes.DOORCLOSED;
            }
        }
        return newTileType;
    }
}
