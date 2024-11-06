import { Component } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
    selector: 'app-inventory',
    standalone: true,
    imports: [MatGridListModule],
    templateUrl: './inventory.component.html',
    styleUrl: './inventory.component.scss',
})
export class InventoryComponent {}
