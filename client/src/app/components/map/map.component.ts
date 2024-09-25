import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { MatGridListModule, MatGridTile } from '@angular/material/grid-list';
import { DEFAULT_MAP_SIZE } from '@app/components/map/constants';
import { TileBasicComponent } from '@app/components/map/tile-basic/tile-basic.component';
import { MapService, Tile } from '@app/services/map.service';
import { DragDropService } from '@app/services/drag-drop.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
@Component({
    selector: 'app-map',
    standalone: true,
    imports: [MatGridListModule, MatGridTile, TileBasicComponent, DragDropModule],
    templateUrl: './map.component.html',
    styleUrl: './map.component.scss',
})
export class MapComponent implements OnInit {
    @Input() mapSize: number = DEFAULT_MAP_SIZE;
    @Input() selectedTileType: string;
    @Output() sendMapEvent = new EventEmitter<Tile[]>();

    mapService = inject(MapService);
    objectDropped: string | null = null;
    constructor(private dragAndDropServiceMap: DragDropService) {
        this.dragAndDropServiceMap.draggedTile$.subscribe((objectType) => {
            this.objectDropped = objectType;
        });
    }
    ngOnInit(): void {
        this.mapService.createGrid(this.mapSize);
    }
    /* onDrop(event: any) {
        window.alert('Object dropped');
         if (this.objectDropped) {
        // // Logic to place the object in the map
        //    this.dragAndDropServiceMap.resetDraggedObject(); // Reset the dragged object ( ALSO CALL METHOD TO REDUCE NUMBER OF POINT DEPART )
        // } 
      }      */
}
