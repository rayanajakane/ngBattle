import { Component, EventEmitter, inject, Output } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DragDropService } from '@app/services/drag-drop.service';
import { MapService } from '@app/services/map.service';
@Component({
    selector: 'app-sidebar',
    standalone: true,
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    imports: [MatGridListModule, MatBadgeModule, MatTooltipModule],
})
export class SidebarComponent {
    @Output() selectItemTypeEvent = new EventEmitter<string>();

    isDragging: boolean = false;
    dragDropService = inject(DragDropService);
    mapService = inject(MapService);
    startDragging(object: string) {
        this.dragDropService.setDraggedObject(object);
        this.selectItemTypeEvent.emit(object);
    }
}
