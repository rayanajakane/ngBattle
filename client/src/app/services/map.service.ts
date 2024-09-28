import { Injectable } from '@angular/core';
import { TileJson } from '@app/data-structure/game-structure';
import { TileTypes } from '@app/data-structure/tileType';

export const DEFAULT_MAP_SIZE = 10;

@Injectable({
    providedIn: 'root',
})
export class MapService {
    tiles: TileJson[];
    oldTiles: TileJson[];
    isMouseDown = false;
    isRightClick = false;

    // Optionally put a map if we import a map
    createGrid(mapSize?: number, tiles?: TileJson[]) {
        if (mapSize != undefined && mapSize <= 0) {
            throw new Error('MapSize must be a positive number.');
        }
        const arraySize = mapSize ? mapSize : DEFAULT_MAP_SIZE;
        this.tiles = tiles
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
        this.oldTiles = JSON.parse(JSON.stringify(this.tiles)); // Deep copy
    }

    resetGridToBasic() {
        this.tiles = JSON.parse(JSON.stringify(this.oldTiles)); // Deep copy
    }

    // Function to automatically change the tile's type
    setTileType(index: number, tileType: string) {
        if (tileType === TileTypes.DOOR) {
            if (this.tiles[index].tileType === TileTypes.DOORCLOSED) {
                tileType = TileTypes.DOOROPEN;
            } else {
                tileType = TileTypes.DOORCLOSED;
            }
        }
        this.tiles[index].tileType = tileType;
    }

    // Triggered when the mouse button is pressed
    onMouseDown(event: MouseEvent, index: number, selectedTileType: string) {
        this.isMouseDown = true;
        if (event.button === 2) {
            this.isRightClick = true;
            this.setTileType(index, TileTypes.BASIC);
        } else {
            this.setTileType(index, selectedTileType);
        }
    }

    // Triggered when the mouse button is released
    onMouseUp() {
        this.isMouseDown = false;
        this.isRightClick = false;
    }

    // Triggered when the mouse enters a tile while pressed
    onMouseEnter(index: number, selectedTileType: string) {
        if (this.isMouseDown) {
            this.setTileType(index, !this.isRightClick ? selectedTileType : TileTypes.BASIC);
        }
    }

    onExit() {
        this.isMouseDown = false;
        this.isRightClick = false;
    }
}
