import { Component } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
    selector: 'app-toolbar',
    standalone: true,
    imports: [MatGridListModule],
    templateUrl: './toolbar.component.html',
    styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {
    items: object = [];
    selectedItem: object = {};
}
