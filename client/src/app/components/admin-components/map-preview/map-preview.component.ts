import { Component, Input } from '@angular/core';
import { Item } from '@app/pages/admin-page/admin-types';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-map-preview',
    standalone: true,
    imports: [MatTooltipModule],
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
