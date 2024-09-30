import { TestBed } from '@angular/core/testing';
import { DragDropService } from './drag-drop.service';

describe('DragDropService', () => {
    let service: DragDropService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DragDropService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set the dragged object', () => {
        const objectType = 'exampleObjectType';
        service.setDraggedObject(objectType);
        expect(service.draggedTile).toBe(objectType);
    });

    it('should reset the dragged object', () => {
        service.resetDraggedObject();
        expect(service.draggedTile).toBe('');
        expect(service.transparentImage).toBe('');
    });

    it('should set the multiple item counter based on map size', () => {
        service.setMultipleItemCounter(10);
        expect(service.startingPointNumberCounter).toBe(2);
        expect(service.randomItemCounter).toBe(2);

        service.setMultipleItemCounter(15);
        expect(service.startingPointNumberCounter).toBe(4);
        expect(service.randomItemCounter).toBe(4);

        service.setMultipleItemCounter(20);
        expect(service.startingPointNumberCounter).toBe(6);
        expect(service.randomItemCounter).toBe(6);
    });

    it('should reduce the number of starting points', () => {
        service.startingPointNumberCounter = 5;
        service.reduceNumberStartingPoints();
        expect(service.startingPointNumberCounter).toBe(4);

        service.startingPointNumberCounter = 0;
        service.reduceNumberStartingPoints();
        expect(service.startingPointNumberCounter).toBe(0);
    });

    it('should reduce the number of random items', () => {
        service.randomItemCounter = 5;
        service.reduceNumberRandomItem();
        expect(service.randomItemCounter).toBe(4);

        service.randomItemCounter = 0;
        service.reduceNumberRandomItem();
        expect(service.randomItemCounter).toBe(0);
    });

    it('should increment the number of starting points', () => {
        service.startingPointNumberCounter = 5;
        service.incrementNumberStartingPoints();
        expect(service.startingPointNumberCounter).toBe(6);
    });

    it('should increment the number of random items', () => {
        service.randomItemCounter = 5;
        service.incrementNumberRandomItem();
        expect(service.randomItemCounter).toBe(6);
    });
});
