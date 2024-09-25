import { Component } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { StartingPointComponent } from '@app/components/starting-point/starting-point.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DragDropService } from '@app/services/drag-drop.service';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    imports: [MatGridListModule, StartingPointComponent, DragDropModule],
})
export class SidebarComponent {
    constructor(private dragDropService: DragDropService) {}
    // Tell the service the right tile type that is dragged
    onDragStarted(objectType: string) {
        this.dragDropService.setDraggedObject(objectType);
    }
}
