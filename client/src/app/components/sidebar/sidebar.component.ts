import { Component, OnInit } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatBadgeModule } from '@angular/material/badge';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DragDropService } from '@app/services/drag-drop.service';
import { MatTooltipModule } from '@angular/material/tooltip';
@Component({
    selector: 'app-sidebar',
    standalone: true,
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    imports: [MatGridListModule, DragDropModule, MatBadgeModule, MatTooltipModule],
})
export class SidebarComponent implements OnInit {
    startingPointNumber: number;
    constructor(private dragDropService: DragDropService) {}
    // Tell the service the right tile type that is dragged

    startDragging(object: string, event: MouseEvent) {
        this.dragDropService.setDraggedObject(object);
        this.dragDropService.updateMousePosition(event.clientX, event.clientY);
    }

    ngOnInit(): void {
        // Get the value of Starting Point
        this.startingPointNumber = this.dragDropService.startingPointNumber;
    }
}
