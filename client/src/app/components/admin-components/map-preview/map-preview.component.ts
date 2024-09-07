import { Component, Input } from '@angular/core';
import { Item } from '@app/pages/admin-page/admin-types';

@Component({
    selector: 'app-map-preview',
    standalone: true,
    imports: [],
    templateUrl: './map-preview.component.html',
    styleUrl: './map-preview.component.scss',
})
export class MapPreviewComponent {
    @Input() item: Item;

    descriptionVisible: boolean = false;

    onMouseOver() {
        this.descriptionVisible = true;
    }
    onMouseLeave() {
        this.descriptionVisible = false;
    }
}
