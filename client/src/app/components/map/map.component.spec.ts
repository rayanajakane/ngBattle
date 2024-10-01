import { ComponentFixture, TestBed } from '@angular/core/testing';
import SpyObj = jasmine.SpyObj;

import { TileTypes } from '@app/data-structure/toolType';
import { DragDropService } from '@app/services/drag-drop.service';
import { MapService } from '@app/services/map.service';
import { DEFAULT_MAP_SIZE } from './constants';
import { MapComponent } from './map.component';

describe('MapComponent', () => {
    let mapServiceSpy: SpyObj<MapService>;
    let dragDropServiceSpy: SpyObj<DragDropService>;
    let component: MapComponent;
    let fixture: ComponentFixture<MapComponent>;

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
            });
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MapComponent],
        }).compileComponents();

        mapServiceSpy = jasmine.createSpyObj('MapService', ['createGrid', 'chooseTileType']);
        TestBed.overrideProvider(MapService, { useValue: mapServiceSpy });

        dragDropServiceSpy = jasmine.createSpyObj('DragDropService', [
            'setDraggedObject',
            'resetDraggedObject',
            'setMultipleItemCounter',
            'reduceNumberStartingPoints',
            'reduceNumberRandomItem',
            'incrementNumberStartingPoints',
            'incrementNumberRandomItem',
        ]);
        TestBed.overrideProvider(DragDropService, { useValue: dragDropServiceSpy });

        fixture = TestBed.createComponent(MapComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        component.mapSize = DEFAULT_MAP_SIZE;
        component.tiles = createTiles(component.mapSize);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('deleteTile should replace a tile by a basic tile', () => {
        component.ngOnInit();
        const tileTypes = ['wall', 'doorOpen', 'doorClosed', 'water', 'ice'];
        const tileType = tileTypes[Math.floor(Math.random() * tileTypes.length)];
        const randomIndex = Math.floor(Math.random() * component.mapSize * component.mapSize);
        component.tiles[randomIndex].tileType = tileType;
        component.deleteTile(randomIndex);
        expect(component.tiles[randomIndex].tileType).toBe(TileTypes.BASIC);
    });

    it('deleteItem should replace a tile by a basic tile', () => {
        component.ngOnInit();
        const possibleItemTypes = ['AA1', 'AA2', 'AC1', 'AC2', 'AF1', 'AF2', 'drapeauA', 'drapeauB'];
        const itemType = possibleItemTypes[Math.floor(Math.random() * possibleItemTypes.length)];
        const randomIndex = Math.floor(Math.random() * component.mapSize * component.mapSize);
        component.tiles[randomIndex].item = itemType;
        component.deleteItem(randomIndex);
        expect(component.tiles[randomIndex].item).toBe('');
    });
});
