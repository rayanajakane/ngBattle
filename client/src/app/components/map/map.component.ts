import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { MatGridListModule, MatGridTile } from '@angular/material/grid-list';
import { DEFAULT_MAP_SIZE } from '@app/components/map/constants';
import { TileBasicComponent } from '@app/components/map/tile-basic/tile-basic.component';
import { DragDropService } from '@app/services/drag-drop.service';
import { MapService, Tile } from '@app/services/map.service';

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
    @Output() sendMapEvent = new EventEmitter<Tile[]>();

    mapService = inject(MapService);

    constructor(private dragDropService: DragDropService) {}

    ngOnInit(): void {
        this.mapService.createGrid(this.mapSize);
    }

    dropObject(event: MouseEvent) {
        // Update the mouse position
        this.dragDropService.updateMousePosition(event.clientX, event.clientY);

        // Get the dragged object directly from the service
        const draggedObject = this.dragDropService.draggedTile;
        if (draggedObject) {
            this.placeObjectOnMap(event.clientX, event.clientY, draggedObject);
            this.dragDropService.resetDraggedObject(); // Reset the drag state
        }
    }

    placeObjectOnMap(x: number, y: number, object: string) {
        window.alert(`Placing ${object} on map at coordinates X: ${x}, Y: ${y}`);
    }
}
