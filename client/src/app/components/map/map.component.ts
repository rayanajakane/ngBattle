import { Component, Input, OnChanges } from '@angular/core';
import { MatGridListModule, MatGridTile } from '@angular/material/grid-list';
import { DEFAULT_MAP_SIZE } from '@app/components/map/constants';
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
export class MapComponent implements OnChanges {
    @Input() mapSize: number = DEFAULT_MAP_SIZE;

    tiles: Tile[];

    constructor() {
        this.tiles = this.createGrid(this.mapSize);
    }


    createGrid(mapSize: number) {
        return Array(mapSize * mapSize)
            .fill(0)
            .map((_, idx) => {
                // Assign a unique id based on the index
                return {
                    index: idx,  // Unique ID for each tile
                    type: 'basic'  // Tile type
                };
            });
    }

    // TODO: No need to recreate the whole object again, we can simply change the type
    // Temporary function meanwhile service ( mouseUp mouse Down) is developed
    createRandomGrid(mapSize: number) {
        // TODO: We can create an enum with all the tileTypes
        const tileTypes = ['basic', 'wall', 'doorOpen', 'doorClosed', 'water', 'ice'];
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
        this.tiles[index].type = tileType;
    }

    ngOnChanges() {
        // Re create the grid list if mapSize changes when our user go back
        this.tiles = this.createRandomGrid(this.mapSize);
    }
}
