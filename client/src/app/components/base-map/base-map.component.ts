import { Component, Input } from '@angular/core';
import { MatGridListModule, MatGridTile } from '@angular/material/grid-list';
import { TileBasicComponent } from '@app/components/map/tile-basic/tile-basic.component';
import { Map } from '@app/interfaces/map';
import { MapBaseService } from '@app/services/map-base.service';

@Component({
    selector: 'app-base-map',
    standalone: true,
    imports: [MatGridListModule, MatGridTile, TileBasicComponent],
    templateUrl: './base-map.component.html',
    styleUrl: './base-map.component.scss',
})
//providers: [MapBaseService] // TODO: Figure out how to add providers in the children
export abstract class BaseMapComponent implements Map {
    @Input() mapSize: number;

    constructor(protected mapService: MapBaseService) {}
}
