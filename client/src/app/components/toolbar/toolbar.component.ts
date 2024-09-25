import { Component, EventEmitter, Output } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { TileBasicComponent } from '@app/components/map/tile-basic/tile-basic.component';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
    selector: 'app-toolbar',
    standalone: true,
    imports: [MatGridListModule, TileBasicComponent, DragDropModule],
    templateUrl: './toolbar.component.html',
    styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {
    @Output() selectTileTypeEvent = new EventEmitter<string>();

    items: object = [];
    selectedItem: object = {};
    selectTileType(tileType: string) {
        this.selectTileTypeEvent.emit(tileType);
    }
}
