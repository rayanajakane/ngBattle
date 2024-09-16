import { Component, Input, OnChanges } from '@angular/core';
import { MatGridListModule, MatGridTile } from '@angular/material/grid-list';
import { TileDoorComponent } from '../tile-door/tile-door.component';
import { TileIceComponent } from '../tile-ice/tile-ice.component';
import { TileWallComponent } from '../tile-wall/tile-wall.component';
import { TileWaterComponent } from '../tile-water/tile-water.component';
@Component({
    selector: 'app-map',
    standalone: true,
    imports: [MatGridListModule, MatGridTile, TileDoorComponent, TileIceComponent, TileWallComponent, TileWaterComponent],
    templateUrl: './map.component.html',
    styleUrl: './map.component.scss',
})
export class MapComponent implements OnChanges {
    @Input() mapSize: number = 15;
    //
    tiles: string[];

    constructor() {
        this.tiles = this.createGrid(this.mapSize);
    }

    // Temporary function meanwhile service ( mouseUp mouse Down) is developed
    createGrid(mapSize: number) {
        const tileTypes = ['wall', 'door', 'water', 'ice'];
        return Array(mapSize * mapSize)
            .fill(0)
            .map(() => {
                // Full the array with random tile types
                return tileTypes[Math.floor(Math.random() * tileTypes.length)];
            });
    }

    ngOnChanges() {
        // Re create the grid list if mapSize changes when our user go back
        this.tiles = this.createGrid(this.mapSize);
    }
}
