import { Injectable } from '@angular/core';

export type Tile = {
    index: number;
    type: string;
};

@Injectable({
    providedIn: 'root',
})
export class MapService {
    tiles: Tile[];
    isMouseDown = false;
    isRightClick = false;

    createGrid(mapSize: number) {
        this.tiles = Array(mapSize * mapSize)
            .fill(0)
            .map((_, idx) => {
                // Assign a unique id based on the index
                return {
                    index: idx, // Unique ID for each tile
                    type: '', // Tile type
                };
            });
    }

    // TODO: No need to recreate the whole object again, we can simply change the type
    // Temporary function meanwhile service ( mouseUp mouse Down) is developed
    createRandomGrid(mapSize: number) {
        // TODO: We can create an enum with all the tileTypes
        const tileTypes = ['', 'wall', 'doorOpen', 'doorClosed', 'water', 'ice'];
        return Array(mapSize * mapSize)
            .fill(0)
            .map((_, idx) => {
                // Full the array with random tile types
                return {
                    index: idx, // Unique ID for each tile
                    type: tileTypes[Math.floor(Math.random() * tileTypes.length)], // Tile type
                };
            });
    }

    resetGridToBasic() {
        this.tiles.forEach((tile) => (tile.type = ''));
    }

    // Function to automatically change the tile's type
    setTileType(index: number, tileType: string) {
        if (tileType === 'door') {
            if (this.tiles[index].type === 'doorClosed') {
                tileType = 'doorOpen';
            } else {
                tileType = 'doorClosed';
            }
        }
        this.tiles[index].type = tileType;
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
