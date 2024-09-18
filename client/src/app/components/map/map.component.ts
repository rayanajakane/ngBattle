import { Component, Input, OnInit, inject } from '@angular/core';
import { MatGridListModule, MatGridTile } from '@angular/material/grid-list';
import { DEFAULT_MAP_SIZE } from '@app/components/map/constants';
import { TileBasicComponent } from '@app/components/map/tile-basic/tile-basic.component';
import { MapService } from '@app/services/map.service';

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

    mapService = inject(MapService);

    ngOnInit() {
        this.mapService.createGrid(this.mapSize);
    }
}
