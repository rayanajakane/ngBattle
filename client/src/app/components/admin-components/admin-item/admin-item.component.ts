import { Component, Input } from '@angular/core';
import { MapPreviewComponent } from '@app/components/admin-components/map-preview/map-preview.component';
import { Item } from '@app/pages/admin-page/admin-types';

@Component({
    selector: 'app-admin-item',
    standalone: true,
    imports: [MapPreviewComponent],
    templateUrl: './admin-item.component.html',
    styleUrl: './admin-item.component.scss',
})
export class AdminItemComponent {
    @Input() item: Item;
    @Input() lastModified: string = '12/09/24';

    options = [
        { value: 'private', label: 'Privee' },
        { value: 'public', label: 'Publique' },
    ];

    invertVisibility() {
        this.item.visibility = !this.item.visibility;
    }

    deleteGame() {
        // TODO: Write the function
    }
}
