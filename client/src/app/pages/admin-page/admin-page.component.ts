import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AdminItemListComponent } from '@app/components/admin-components/admin-item-list/admin-item-list.component';
import { Item } from './admin-types';

@Component({
    selector: 'app-admin-page',
    standalone: true,
    imports: [AdminItemListComponent, RouterLink, RouterOutlet],
    templateUrl: './admin-page.component.html',
    styleUrl: './admin-page.component.scss',
})
export class AdminPageComponent {
    items: Item[] = [
        { id: 1, name: 'item1', size: 'small', mode: 'CTF', visibility: true, description: 'Sample Text 1' },
        { id: 2, name: 'item2', size: 'medium', mode: 'TDM', visibility: false, description: 'Sample Text 2' },
        { id: 3, name: 'item3', size: 'large', mode: 'FFA', visibility: false, description: 'Sample Text 3' },
        { id: 4, name: 'item4', size: 'small', mode: 'CTF', visibility: false, description: 'Sample Text 4' },
        { id: 5, name: 'item5', size: 'medium', mode: 'TDM', visibility: true, description: 'Sample Text 5' },
    ];
}
