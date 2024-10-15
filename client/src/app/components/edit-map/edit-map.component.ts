import { Component, inject } from '@angular/core';
import { MapEditService } from '@app/services/map-edit.service';
import { BaseMapComponent } from '../base-map/base-map.component';

@Component({
    selector: 'app-edit-map',
    standalone: true,
    imports: [],
    templateUrl: '../base-map/base-map.component.html', //reuse base-map template
    styleUrl: './edit-map.component.scss',
})
export class EditMapComponent extends BaseMapComponent {
    mapService = inject(MapEditService);

    onRightClick(index: number): void {}
    onMouseDown(index: number, event: MouseEvent): void {}
    onMouseUp(index: number, event: MouseEvent): void {}
    onDrop(index: number): void {}
    onDragOver(): void {}
    onMouseEnter(index: number, event: MouseEvent): void {}
    onExit(): void {}
}
