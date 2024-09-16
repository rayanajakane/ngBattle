import { Component } from '@angular/core';

@Component({
  selector: 'app-tile-basic',
  standalone: true,
  imports: [],
  templateUrl: './tile-basic.component.html',
  styleUrl: './tile-basic.component.scss'
})
export class TileBasicComponent {
    imageUrl = './../../../assets/GROUND.jpg';
}
