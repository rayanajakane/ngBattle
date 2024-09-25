import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DragDropService {
    // Following the tile that is dragged
    draggedTileSource = new BehaviorSubject<string | null>(null);
    // Create the observable for the map to subscribe to
    draggedTile$ = this.draggedTileSource.asObservable();
    // Method to update the dragged tile
    setDraggedObject(objetType: string) {
        this.draggedTileSource.next(objetType);
    }
    // Method to reset the dragged tile ( we can call this method when the tile is dropped in the map ! )
    resetDraggedObject() {
        this.draggedTileSource.next(null);
    }
}
