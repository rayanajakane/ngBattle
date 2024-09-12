import { Component, Input } from '@angular/core';
import { Item } from '@app/pages/admin-page/admin-types';

@Component({
    selector: 'app-admin-item',
    standalone: true,
    imports: [],
    templateUrl: './admin-item.component.html',
    styleUrl: './admin-item.component.scss',
})
export class AdminItemComponent {
    @Input() item: Item = {};
    @Input() lastModified: string = '12/09/24';

    invertVisibility() {
        this.item.visibility = !this.item.visibility;
    }

    // deleteGame() {
    //     // TODO: Write the function
    // }
}
