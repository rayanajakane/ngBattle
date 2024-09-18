import { Component, EventEmitter, Output } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
    selector: 'app-toolbar',
    standalone: true,
    imports: [MatGridListModule],
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
