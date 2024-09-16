import { Component, Input, OnInit } from '@angular/core';
import { MatGridListModule, MatGridTile } from '@angular/material/grid-list';
import { TileBasicComponent } from '@app/components/map/tile-basic/tile-basic.component';

type Tile = {
    index: number;
    type: string;
};

@Component({
    selector: 'app-map',
    standalone: true,
    imports: [MatGridListModule, MatGridTile, TileBasicComponent],
    templateUrl: './map.component.html',
    styleUrl: './map.component.scss',
})
export class MapComponent implements OnInit {
    @Input() mapSize: number;
    @Input() selectedTileType: string;

    tiles: Tile[];
    isMouseDown = false;
    isRightClick = false;

    ngOnInit() {
        this.tiles = this.createGrid(this.mapSize);
    }

    createGrid(mapSize: number) {
        return Array(mapSize * mapSize)
            .fill(0)
            .map((_, idx) => {
                // Assign a unique id based on the index
                return {
                    index: idx,  // Unique ID for each tile
                    type: '',  // Tile type
                };
            });
    }

    resetGridToBasic() {
        this.tiles.forEach((tile) => tile.type = '');
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
                    index: idx,  // Unique ID for each tile
                    type: tileTypes[Math.floor(Math.random() * tileTypes.length)]  // Tile type
                };
            });
    }

    // Function to automatically change the tile's type
    setTileType(index: number, tileType: string) {
        if (tileType == "door") {
            if (this.tiles[index].type == 'doorClosed') {
                tileType = "doorOpen"
            } else {
                tileType = "doorClosed";
            }
        }
        this.tiles[index].type = tileType;
    }

    // Triggered when the mouse button is pressed
    onMouseDown(event: MouseEvent, index: number) {
        this.isMouseDown = true;
        if (event.button === 2) {
            this.isRightClick = true;
            this.setTileType(index, '');
          } else {
            this.setTileType(index, this.selectedTileType);
          }
    }

  // Triggered when the mouse button is released
    onMouseUp() {
        this.isMouseDown = false;
        this.isRightClick = false;
    }

  // Triggered when the mouse enters a tile while pressed
    onMouseEnter(index: number) {
        if (this.isMouseDown) {
            this.setTileType(index, !this.isRightClick? this.selectedTileType: '');
        }
    }

    // ngOnChanges() {
    //     // Re create the grid list if mapSize changes when our user go back
    //     this.tiles = this.createRandomGrid(this.mapSize);
    // }
}
