import { DragDropModule } from '@angular/cdk/drag-drop';
import { Component, inject } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DragDropService } from '@app/services/drag-drop.service';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    imports: [MatGridListModule, DragDropModule, MatBadgeModule, MatTooltipModule],
})
export class SidebarComponent {
    dragDropService = inject(DragDropService);
    startDragging(object: string) {
        this.dragDropService.setDraggedObject(object);
    }
}
