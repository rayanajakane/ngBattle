import { Component } from '@angular/core';
import { AdminItemListComponent } from '@app/components/admin-components/admin-item-list/admin-item-list.component';
import { Item } from './admin-types';

@Component({
    selector: 'app-admin-page',
    standalone: true,
    imports: [AdminItemListComponent],
    templateUrl: './admin-page.component.html',
    styleUrl: './admin-page.component.scss',
})
export class AdminPageComponent {
    items: Item[] = [
        { id: 1, name: 'item1', size: 'small', mode: 'CTF', visibility: true },
        { id: 2, name: 'item2', size: 'medium', mode: 'TDM', visibility: true },
        { id: 3, name: 'item3', size: 'large', mode: 'FFA', visibility: true },
        { id: 4, name: 'item4', size: 'small', mode: 'CTF', visibility: true },
        { id: 5, name: 'item5', size: 'medium', mode: 'TDM', visibility: true },
    ];
}
