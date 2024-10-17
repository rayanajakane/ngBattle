import { Component, Input } from '@angular/core';
import { MatGridListModule, MatGridTile } from '@angular/material/grid-list';
import { TileBasicComponent } from '@app/components/tile-basic/tile-basic.component';
import { TileJson } from '@app/data-structure/game-structure';

@Component({
    selector: 'app-map-preview',
    standalone: true,
    imports: [MatGridListModule, MatGridTile, TileBasicComponent],
    templateUrl: './map-preview.component.html',
    styleUrl: './map-preview.component.scss',
})
export class MapPreviewComponent {
    @Input() mapSize: number;
    @Input() tiles: TileJson[];
}
