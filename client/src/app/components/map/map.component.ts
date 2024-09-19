import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { MatGridListModule, MatGridTile } from '@angular/material/grid-list';
import { DEFAULT_MAP_SIZE } from '@app/components/map/constants';
import { TileBasicComponent } from '@app/components/map/tile-basic/tile-basic.component';
import { MapService, Tile } from '@app/services/map.service';

@Component({
    selector: 'app-map',
    standalone: true,
    imports: [MatGridListModule, MatGridTile, TileBasicComponent],
    templateUrl: './map.component.html',
    styleUrl: './map.component.scss',
})
export class MapComponent implements OnInit {
    @Input() mapSize: number = DEFAULT_MAP_SIZE;
    @Input() selectedTileType: string;
    @Output() sendMapEvent = new EventEmitter<Tile[]>();

    mapService = inject(MapService);

    ngOnInit() {
        this.mapService.createGrid(this.mapSize);
    }
}
