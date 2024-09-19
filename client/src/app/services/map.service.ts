import { Injectable } from '@angular/core';
import { TileJson } from '@app/data-structure/game-structure';

@Injectable({
    providedIn: 'root',
})
export class MapService {
    tiles: TileJson[];
    oldTiles: TileJson[];
    isMouseDown = false;
    isRightClick = false;

    // Optionally put a map if we import a map
    createGrid(mapSize: number, tiles?: TileJson[]) {
        this.tiles = tiles
            ? tiles
            : Array(mapSize * mapSize)
                  .fill(0)
                  .map((_, index) => {
                      // Assign a unique id based on the index
                      return {
                          idx: index, // Unique ID for each tile
                          tileType: '', // Tile type
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
        if (tileType === 'door') {
            if (this.tiles[index].tileType === 'doorClosed') {
                tileType = 'doorOpen';
            } else {
                tileType = 'doorClosed';
            }
        }
        this.tiles[index].tileType = tileType;
    }

    // Triggered when the mouse button is pressed
    onMouseDown(event: MouseEvent, index: number, selectedTileType: string) {
        this.isMouseDown = true;
        if (event.button === 2) {
            this.isRightClick = true;
            this.setTileType(index, '');
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
            this.setTileType(index, !this.isRightClick ? selectedTileType : '');
        }
    }
}
