import { Component, Input } from '@angular/core';
import { AdminItemComponent } from '@app/components/admin-components/admin-item/admin-item.component';
import { Item } from '@app/pages/admin-page/admin-types';
@Component({
    selector: 'app-admin-item-list',
    standalone: true,
    imports: [AdminItemComponent],
    templateUrl: './admin-item-list.component.html',
    styleUrl: './admin-item-list.component.scss',
})
export class AdminItemListComponent {
    @Input() items: Item[] = [];
}
