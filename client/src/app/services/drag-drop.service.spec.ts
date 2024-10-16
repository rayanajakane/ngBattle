// import { TestBed } from '@angular/core/testing';
// import { DragDropService } from './drag-drop.service';

// describe('DragDropService', () => {
//     let service: DragDropService;

//     beforeEach(() => {
//         TestBed.configureTestingModule({});
//         service = TestBed.inject(DragDropService);
//     });

//     it('should be created', () => {
//         expect(service).toBeTruthy();
//     });

//     it('should set the dragged object', () => {
//         const objectType = 'exampleObjectType';
//         service.setDraggedObject(objectType);
//         expect(service.draggedTile).toBe(objectType);
//     });

//     it('should reset the dragged object', () => {
//         service.resetDraggedObject();
//         expect(service.draggedTile).toBe('');
//         expect(service.transparentImage).toBe('');
//     });

//     it('should set the multiple item counter based on map size', () => {
//         const MAP_SIZE_SMALL = 10;
//         const MAP_SIZE_MEDIUM = 15;
//         const MAP_SIZE_LARGE = 20;
//         const STARTING_COUNTER_TWO = 2;
//         const RANDOM_ITEM_COUNTER_TWO = 2;
//         const STARTING_COUNTER_FOUR = 4;
//         const RANDOM_ITEM_COUNTER_FOUR = 4;
//         const STARTING_COUNTER_SIX = 6;
//         const RANDOM_ITEM_COUNTER_SIX = 6;
//         service.setMultipleItemCounter(MAP_SIZE_SMALL);
//         expect(service.startingPointNumberCounter).toBe(STARTING_COUNTER_TWO);
//         expect(service.randomItemCounter).toBe(RANDOM_ITEM_COUNTER_TWO);

//         service.setMultipleItemCounter(MAP_SIZE_MEDIUM);
//         expect(service.startingPointNumberCounter).toBe(STARTING_COUNTER_FOUR);
//         expect(service.randomItemCounter).toBe(RANDOM_ITEM_COUNTER_FOUR);

//         service.setMultipleItemCounter(MAP_SIZE_LARGE);
//         expect(service.startingPointNumberCounter).toBe(STARTING_COUNTER_SIX);
//         expect(service.randomItemCounter).toBe(RANDOM_ITEM_COUNTER_SIX);
//     });

//     it('should reduce the number of starting points', () => {
//         const STARTING_COUNTER = 5;
//         const REDUCE_COUNTER = 4;
//         service.startingPointNumberCounter = STARTING_COUNTER;
//         service.reduceNumberStartingPoints();
//         expect(service.startingPointNumberCounter).toBe(REDUCE_COUNTER);
//         const REDUCE_COUNTER_ZERO = 0;
//         service.startingPointNumberCounter = REDUCE_COUNTER_ZERO;
//         service.reduceNumberStartingPoints();
//         expect(service.startingPointNumberCounter).toBe(REDUCE_COUNTER_ZERO);
//     });

//     it('should reduce the number of random items', () => {
//         const RANDOM_ITEM_COUNTER = 5;
//         const RANDOM_ITEM_REDUCE_COUNTER = 4;
//         const RANDOM_ITEM_NULL = 0;
//         service.randomItemCounter = RANDOM_ITEM_COUNTER;
//         service.reduceNumberRandomItem();
//         expect(service.randomItemCounter).toBe(RANDOM_ITEM_REDUCE_COUNTER);

//         service.randomItemCounter = RANDOM_ITEM_NULL;
//         service.reduceNumberRandomItem();
//         expect(service.randomItemCounter).toBe(RANDOM_ITEM_NULL);
//     });

//     it('should increment the number of starting points', () => {
//         const STARTING_COUNTER = 5;
//         const STARTING_COUNTER_INCREMENT = 6;
//         service.startingPointNumberCounter = STARTING_COUNTER;
//         service.incrementNumberStartingPoints();
//         expect(service.startingPointNumberCounter).toBe(STARTING_COUNTER_INCREMENT);
//     });

//     it('should increment the number of random items', () => {
//         const RANDOM_ITEM_COUNTER = 5;
//         const RANDOM_ITEM_INCREMENT = 6;
//         service.randomItemCounter = RANDOM_ITEM_COUNTER;
//         service.incrementNumberRandomItem();
//         expect(service.randomItemCounter).toBe(RANDOM_ITEM_INCREMENT);
//     });
// });
