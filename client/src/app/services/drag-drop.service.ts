import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DEFAULT_STARTING_POINT_NUMBER } from '@app/services/constants-service';

@Injectable({
    providedIn: 'root',
})
export class DragDropService {
    startingPointNumber: number = DEFAULT_STARTING_POINT_NUMBER;
    mousePosition$: Observable<{ x: number; y: number }>;
    isDragging$: Observable<boolean>;
    draggedTile$: Observable<string>;

    private draggedTileSource: BehaviorSubject<string>;
    private isDraggingSource: BehaviorSubject<boolean>;
    private mousePositionSource: BehaviorSubject<{ x: number; y: number }>;

    constructor() {
        this.draggedTileSource = new BehaviorSubject<string>('');
        this.draggedTile$ = this.draggedTileSource.asObservable();

        this.isDraggingSource = new BehaviorSubject<boolean>(false);
        this.isDragging$ = this.isDraggingSource.asObservable();

        this.mousePositionSource = new BehaviorSubject<{ x: number; y: number }>({ x: 0, y: 0 });
        this.mousePosition$ = this.mousePositionSource.asObservable();
    }

    // // BehaviorSubject to track the currently dragged tile
    // private draggedTileSource = new BehaviorSubject<string>("");
    // draggedTile$ = this.draggedTileSource.asObservable();

    // // BehaviorSubject to track if drag is active
    // private isDraggingSource = new BehaviorSubject<boolean>(false);
    // isDragging$ = this.isDraggingSource.asObservable();

    // // Store mouse position for custom drag handling
    // private mousePositionSource = new BehaviorSubject<{ x: number, y: number }>({ x: 0, y: 0 });
    // mousePosition$ = this.mousePositionSource.asObservable();

    // Method to set the dragged tile object when the user starts dragging
    setDraggedObject(objectType: string) {
        this.draggedTileSource.next(objectType);
        this.isDraggingSource.next(true);
    }

    // Method to reset the dragged object when the tile is dropped or drag is cancelled
    resetDraggedObject() {
        this.draggedTileSource.next('');
        this.isDraggingSource.next(false);
    }

    // Update mouse position (to be used during drag)
    updateMousePosition(x: number, y: number) {
        this.mousePositionSource.next({ x, y });
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
