import { Injectable } from '@angular/core';
import { MapBaseService } from './map-base.service';

@Injectable({
    providedIn: 'root',
})
export class MapEditService extends MapBaseService {
    handleMapClick(event: MouseEvent): void {
        console.log('Edit map clicked');
    }
}
