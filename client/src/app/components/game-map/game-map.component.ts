import { Component, inject } from '@angular/core';
import { MapGameService } from '@app/services/map-game.service';
import { BaseMapComponent } from '../base-map/base-map.component';

@Component({
    selector: 'app-game-map',
    standalone: true,
    imports: [],
    templateUrl: '../base-map/base-map.component.html', //reuse base-map template
    styleUrl: './game-map.component.scss',
})
export class GameMapComponent extends BaseMapComponent {
    mapService = inject(MapGameService);

    onRightClick(index: number): void {}
    onMouseDown(index: number, event: MouseEvent): void {}
    onMouseUp(index: number, event: MouseEvent): void {}
    onDrop(index: number): void {}
    onDragOver(): void {}
    onMouseEnter(index: number, event: MouseEvent): void {}
    onExit(): void {}
}
