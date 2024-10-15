import { Injectable } from '@angular/core';
import { MapBaseService } from './map-base.service';

@Injectable({
    providedIn: 'root',
})
export class MapGameService extends MapBaseService {
    handleMapClick(event: MouseEvent): void {
        console.log('Game map clicked');
    }
}
