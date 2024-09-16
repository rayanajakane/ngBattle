import { Component } from '@angular/core';

@Component({
    selector: 'app-tile-wall',
    standalone: true,
    imports: [],
    templateUrl: './tile-wall.component.html',
    styleUrl: './tile-wall.component.scss',
})
export class TileWallComponent {
    imageUrl = './../../../assets/WALL.jpg';
}
