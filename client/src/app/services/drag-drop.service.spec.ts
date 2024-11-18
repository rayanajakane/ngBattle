import { TestBed } from '@angular/core/testing';
import { TileTypes } from '@app/data-structure/toolType';
import { TileStructure } from '@common/game-structure';
import { DragDropService } from './drag-drop.service';

describe('DragDropService', () => {
    let service: DragDropService;

    const MAP_SIZE_SMALL = 10;
    const MAP_SIZE_MEDIUM = 15;
    const MAP_SIZE_LARGE = 20;
    const STARTING_COUNTER_TWO = 2;
    const RANDOM_ITEM_COUNTER_TWO = 2;
    const STARTING_COUNTER_FOUR = 4;
    const RANDOM_ITEM_COUNTER_FOUR = 4;
    const STARTING_COUNTER_SIX = 6;
    const RANDOM_ITEM_COUNTER_SIX = 6;

    function createTiles(size: number) {
        return Array(size * size)
            .fill(0)
            .map((_, index) => {
                // Assign a unique id based on the index
                return {
                    idx: index, // Unique ID for each tile
                    tileType: TileTypes.BASIC, // Tile type
                    item: '',
                    hasPlayer: false,
                };
            }) as TileStructure[];
    }

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
        const tilesSmall = createTiles(MAP_SIZE_SMALL);
        service.setMultipleItemCounter(MAP_SIZE_SMALL, tilesSmall);
        expect(service.startingPointCounter).toBe(STARTING_COUNTER_TWO);
        expect(service.itemCounter(RANDOM_ITEM_COUNTER_TWO);

        const tilesMedium = createTiles(MAP_SIZE_MEDIUM);
        service.setMultipleItemCounter(MAP_SIZE_MEDIUM, tilesMedium);
        expect(service.startingPointCounter).toBe(STARTING_COUNTER_FOUR);
        expect(service.itemCounter(RANDOM_ITEM_COUNTER_FOUR);

        const tilesLarge = createTiles(MAP_SIZE_LARGE);
        service.setMultipleItemCounter(MAP_SIZE_LARGE, tilesLarge);
        expect(service.startingPointCounter).toBe(STARTING_COUNTER_SIX);
        expect(service.itemCounter(RANDOM_ITEM_COUNTER_SIX);
    });

    it('should set the multiple item counter based on map content ', () => {
        const tiles = createTiles(MAP_SIZE_SMALL);
        tiles[0].item = 'startingPoint';
        tiles[1].item = 'item-aleatoire';
        service.setMultipleItemCounter(MAP_SIZE_SMALL, tiles);
        expect(service.startingPointCounter).toBe(STARTING_COUNTER_TWO - 1);
        expect(service.itemCounter(RANDOM_ITEM_COUNTER_TWO - 1);
    });

    it('should set the multiple item counter to zero if placedStartingPoints too high ', () => {
        const tiles = createTiles(MAP_SIZE_SMALL);
        tiles[0].item = 'startingPoint';
        tiles[1].item = 'startingPoint';
        tiles[2].item = 'startingPoint';

        tiles[3].item = 'item-aleatoire';
        tiles[4].item = 'item-aleatoire';
        tiles[5].item = 'item-aleatoire';

        service.setMultipleItemCounter(MAP_SIZE_SMALL, tiles);
        expect(service.startingPointCounter).toBe(0);
        expect(service.itemCounter(0);
    });

    it('should reduce the number of starting points', () => {
        const STARTING_COUNTER = 5;
        const REDUCE_COUNTER = 4;
        service.startingPointCounter = STARTING_COUNTER;
        service.reduceStartingPointCounter();
        expect(service.startingPointCounter).toBe(REDUCE_COUNTER);
        const REDUCE_COUNTER_ZERO = 0;
        service.startingPointCounter = REDUCE_COUNTER_ZERO;
        service.reduceStartingPointCounter();
        expect(service.startingPointCounter).toBe(REDUCE_COUNTER_ZERO);
    });

    it('should reduce the number of random items', () => {
        const RANDOM_ITEM_COUNTER = 5;
        const RANDOM_ITEM_REDUCE_COUNTER = 4;
        const RANDOM_ITEM_NULL = 0;
        service.itemCounterDOM_ITEM_COUNTER;
        service.reduceItemCounter();
        expect(service.itemCounter(RANDOM_ITEM_REDUCE_COUNTER);

        service.itemCounterDOM_ITEM_NULL;
        service.reduceItemCounter();
        expect(service.itemCounter(RANDOM_ITEM_NULL);
    });

    it('should increment the number of starting points', () => {
        const STARTING_COUNTER = 5;
        const STARTING_COUNTER_INCREMENT = 6;
        service.startingPointCounter = STARTING_COUNTER;
        service.incrementNumberStartingPoints();
        expect(service.startingPointCounter).toBe(STARTING_COUNTER_INCREMENT);
    });

    it('should increment the number of random items', () => {
        const RANDOM_ITEM_COUNTER = 5;
        const RANDOM_ITEM_INCREMENT = 6;
        service.itemCounterDOM_ITEM_COUNTER;
        service.incrementNumberItem();
        expect(service.itemCounter(RANDOM_ITEM_INCREMENT);
    });
});
