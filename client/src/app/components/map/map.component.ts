import { Component, Input } from '@angular/core';
import { MatGridListModule, MatGridTile } from '@angular/material/grid-list';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [MatGridListModule, MatGridTile],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent {
    @Input() mapSize : number = 15;
    //
    tiles : string[];
    constructor( ) {

        this.tiles = Array(this.mapSize*this.mapSize).fill('TUILEEE')

    }


    CreateGrid(mapSize: number) {

    }


    ngAfterViewInit() {}
}
