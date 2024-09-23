import { Component, ViewChild, ElementRef } from '@angular/core';

@Component({
    selector: 'app-character-selection-page',
    standalone: true,
    imports: [],
    templateUrl: './character-selection-page.component.html',
    styleUrl: './character-selection-page.component.scss',
})
export class CharacterSelectionPageComponent {
    @ViewChild('widgetsContent', { static: false }) widgetsContent: ElementRef;

    scrollLeft() {
        this.widgetsContent.nativeElement.scrollLeft -= 300;
    }

    scrollRight() {
        this.widgetsContent.nativeElement.scrollLeft += 300;
    }
}
