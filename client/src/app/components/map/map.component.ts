import { Component, inject, Input, OnInit } from '@angular/core';
import { MatGridListModule, MatGridTile } from '@angular/material/grid-list';
import { DEFAULT_MAP_SIZE } from '@app/components/map/constants';
import { TileBasicComponent } from '@app/components/map/tile-basic/tile-basic.component';
import { DragDropService } from '@app/services/drag-drop.service';
import { MapService } from '@app/services/map.service';

@Component({
    selector: 'app-map',
    standalone: true,
    imports: [MatGridListModule, MatGridTile, TileBasicComponent],
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
    @Input() mapSize: number = DEFAULT_MAP_SIZE;
    @Input() selectedTileType: string;

    mapService = inject(MapService);
    dragDropService = inject(DragDropService);
    ngOnInit(): void {
        this.mapService.createGrid(this.mapSize);
    }
}
