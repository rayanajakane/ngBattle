import { Component } from '@angular/core';

@Component({
    selector: 'app-tile-door',
    standalone: true,
    imports: [],
    templateUrl: './tile-door.component.html',
    styleUrl: './tile-door.component.scss',
})
export class TileDoorComponent {
    imageUrlClosed = './../../../assets/DOOR_CLOSED.jpg';
    imageUrlOpen = './../../../assets/DOOR_OPEN.png';
}
