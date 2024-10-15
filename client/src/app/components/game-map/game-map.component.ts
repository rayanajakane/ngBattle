import { Component } from '@angular/core';
import { MapBaseService } from '@app/services/map-base.service';
import { MapGameService } from '@app/services/map-game.service';
import { BaseMapComponent } from '../base-map/base-map.component';

@Component({
    selector: 'app-game-map',
    standalone: true,
    imports: [],
    templateUrl: '../base-map/base-map.component.html', //reuse base-map template
    styleUrl: '../base-map/base-map.component.scss',
    providers: [{ provide: MapBaseService, useClass: MapGameService }],
})
export class GameMapComponent extends BaseMapComponent {}
