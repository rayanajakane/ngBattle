import { Injectable } from '@angular/core';
import { DEFAULT_STARTING_POINT_NUMBER } from '@app/services/constants-service';

@Injectable({
    providedIn: 'root',
})
export class DragDropService {
    startingPointNumber: number = DEFAULT_STARTING_POINT_NUMBER;

    // Direct public variables instead of BehaviorSubjects or Observables
    draggedTile: string = ''; // stores the type of the dragged tile
    isDragging: boolean = false; // stores whether an item is being dragged
    mousePosition: { x: number; y: number } = { x: 0, y: 0 }; // stores the mouse position

    // Method to set the dragged tile object when the user starts dragging
    setDraggedObject(objectType: string) {
        this.draggedTile = objectType;
        this.isDragging = true;
    }

    // Method to reset the dragged object when the tile is dropped or drag is cancelled
    resetDraggedObject() {
        this.draggedTile = '';
        this.isDragging = false;
    }

    // Update mouse position (to be used during drag)
    updateMousePosition(x: number, y: number) {
        this.mousePosition = { x, y };
    }

    // Handle reducing the number of random items (like 'starting points')
    reduceNumberRandomItem() {
        this.startingPointNumber--;
    }

    // Reset the number of random items
    resetNumberRandomItem() {
        this.startingPointNumber = DEFAULT_STARTING_POINT_NUMBER;
    }
}
