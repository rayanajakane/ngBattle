import { TestBed } from '@angular/core/testing';

import { MapEditService } from './map-edit.service';

describe('MapEditService', () => {
    let service: MapEditService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MapEditService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import SpyObj = jasmine.SpyObj;

// import { CurrentMode } from '@app/data-structure/editViewSelectedMode';
// import { TileTypes } from '@app/data-structure/toolType';
// import { DragDropService } from '@app/services/drag-drop.service';
// import { MapService } from '@app/services/map.service';
// import { DEFAULT_MAP_SIZE } from '../constants';
// import { MapComponent } from './map.component';

// describe('MapComponent', () => {
//     let mapServiceSpy: SpyObj<MapService>;
//     let component: MapComponent;
//     let fixture: ComponentFixture<MapComponent>;

//     function createTiles(size: number) {
//         return Array(size * size)
//             .fill(0)
//             .map((_, index) => {
//                 // Assign a unique id based on the index
//                 return {
//                     idx: index, // Unique ID for each tile
//                     tileType: TileTypes.BASIC, // Tile type
//                     item: '',
//                     hasPlayer: false,
//                 };
//             });
//     }

//     beforeEach(async () => {
//         await TestBed.configureTestingModule({
//             imports: [MapComponent],
//             providers: [DragDropService],
//         }).compileComponents();

//         mapServiceSpy = jasmine.createSpyObj('MapService', ['createGrid', 'chooseTileType']);
//         TestBed.overrideProvider(MapService, { useValue: mapServiceSpy });

//         fixture = TestBed.createComponent(MapComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();

//         component.mapSize = DEFAULT_MAP_SIZE;
//         component.tiles = createTiles(component.mapSize);
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });

//     it('deleteTile should replace a tile by a basic tile', () => {
//         component.ngOnInit();
//         const tileTypes = ['wall', 'doorOpen', 'doorClosed', 'water', 'ice'];
//         const tileType = tileTypes[Math.floor(Math.random() * tileTypes.length)];
//         const randomIndex = Math.floor(Math.random() * component.mapSize * component.mapSize);
//         component.tiles[randomIndex].tileType = tileType;
//         component.deleteTile(randomIndex);
//         expect(component.tiles[randomIndex].tileType).toBe(TileTypes.BASIC);
//     });

//     it('deleteItem should remove the item', () => {
//         component.ngOnInit();
//         const possibleItemTypes = ['AA1', 'AA2', 'AC1', 'AC2', 'AF1', 'AF2', 'drapeauA', 'drapeauB'];
//         const itemType = possibleItemTypes[Math.floor(Math.random() * possibleItemTypes.length)];
//         const randomIndex = Math.floor(Math.random() * component.mapSize * component.mapSize);
//         component.tiles[randomIndex].item = itemType;
//         component.deleteItem(randomIndex);
//         expect(component.tiles[randomIndex].item).toBe('');
//     });

//     it('deleteItem should call incrementNumberStartingPoints', () => {
//         const incrementStartingPointsSpy = spyOn(component.dragDropService, 'incrementNumberStartingPoints');
//         component.tiles[0].item = 'startingPoint';
//         component.deleteItem(0);
//         expect(incrementStartingPointsSpy).toHaveBeenCalled();
//     });

//     it('deleteItem should call incrementNumberRandomItem', () => {
//         const incrementNumberRandomItemSpy = spyOn(component.dragDropService, 'incrementNumberRandomItem');
//         component.tiles[0].item = 'item-aleatoire';
//         component.deleteItem(0);
//         expect(incrementNumberRandomItemSpy).toHaveBeenCalled();
//     });

//     it('delete should call deleteItem', () => {
//         const deleteItemSpy = spyOn(component, 'deleteItem');
//         component.tiles[0].item = 'item-aleatoire';
//         component.delete(0);
//         expect(deleteItemSpy).toHaveBeenCalled();
//     });

//     it('delete should call deleteTile', () => {
//         const deleteTileSpy = spyOn(component, 'deleteTile');
//         component.tiles[0].tileType = TileTypes.WALL;
//         component.delete(0);
//         expect(deleteTileSpy).toHaveBeenCalled();
//     });

//     it('placeTile should call setTileType', () => {
//         const setTileTypeSpy = spyOn(component, 'setTileType');
//         component.isMouseDown = true;
//         component.isLeftClick = true;
//         component.selectedTileType = 'wall';
//         component.selectedMode = CurrentMode.TileTool;
//         component.placeTile(0);
//         expect(setTileTypeSpy).toHaveBeenCalled();
//     });

//     it('setTileType should call deleteItem if the tile type is wall', () => {
//         const deleteItemSpy = spyOn(component, 'deleteItem');
//         component.setTileType(0, 'wall');
//         expect(deleteItemSpy).toHaveBeenCalled();
//     });

//     it('setTileType should call deleteItem if the tile type is door', () => {
//         const deleteItemSpy = spyOn(component, 'deleteItem');
//         component.setTileType(0, 'door');
//         expect(deleteItemSpy).toHaveBeenCalled();
//     });

//     it('setTileType should call chooseTileType', () => {
//         component.setTileType(0, 'wall');
//         expect(mapServiceSpy.chooseTileType).toHaveBeenCalled();
//     });

//     it('setItemType should call resetDraggedObject', () => {
//         const resetDraggedObjectSpy = spyOn(component.dragDropService, 'resetDraggedObject');
//         component.tiles[0].tileType = TileTypes.BASIC;
//         component.dragDropService.draggedTile = 'wall';
//         component.setItemType(0, 'wall');
//         expect(resetDraggedObjectSpy).toHaveBeenCalled();
//     });

//     it('setItemType should call reduceNumberStartingPoints', () => {
//         const reduceNumberStartingPointsSpy = spyOn(component.dragDropService, 'reduceNumberStartingPoints');
//         component.tiles[0].tileType = TileTypes.BASIC;
//         component.dragDropService.startingPointNumberCounter = 1;
//         component.dragDropService.draggedTile = 'wall';
//         component.setItemType(0, 'startingPoint');
//         expect(reduceNumberStartingPointsSpy).toHaveBeenCalled();
//     });

//     it('setItemType should call reduceNumberRandomItem', () => {
//         const reduceNumberRandomItemSpy = spyOn(component.dragDropService, 'reduceNumberRandomItem');
//         component.tiles[0].tileType = TileTypes.BASIC;
//         component.dragDropService.randomItemCounter = 1;
//         component.dragDropService.draggedTile = 'wall';
//         component.setItemType(0, 'item-aleatoire');
//         expect(reduceNumberRandomItemSpy).toHaveBeenCalled();
//     });

//     it('setItemType should return if tileType is wall', () => {
//         component.tiles[0].tileType = TileTypes.WALL;
//         component.dragDropService.draggedTile = 'wall';
//         component.setItemType(0, 'item-aleatoire');
//         expect(component.tiles[0].item).toBe('');
//     });

//     it('setItemType should return if tileType is doorClosed', () => {
//         component.tiles[0].tileType = TileTypes.DOORCLOSED;
//         component.dragDropService.draggedTile = 'wall';
//         component.setItemType(0, 'item-aleatoire');
//         expect(component.tiles[0].item).toBe('');
//     });

//     it('setItemType should return if tileType is doorOpen', () => {
//         component.tiles[0].tileType = TileTypes.DOOROPEN;
//         component.dragDropService.draggedTile = 'wall';
//         component.setItemType(0, 'item-aleatoire');
//         expect(component.tiles[0].item).toBe('');
//     });

//     it('setItemType should return if draggedTile is empty', () => {
//         component.tiles[0].tileType = TileTypes.BASIC;
//         component.dragDropService.draggedTile = '';
//         component.setItemType(0, 'item-aleatoire');
//         expect(component.tiles[0].item).toBe('');
//     });

//     it('setItemType should return if itemType is startingPoint and counter is 0', () => {
//         component.tiles[0].tileType = TileTypes.BASIC;
//         component.dragDropService.draggedTile = 'wall';
//         component.dragDropService.startingPointNumberCounter = 0;
//         component.setItemType(0, 'startingPoint');
//         expect(component.tiles[0].item).toBe('');
//     });

//     it('setItemType should return if itemType is item-aleatoire and counter is 0', () => {
//         component.tiles[0].tileType = TileTypes.BASIC;
//         component.dragDropService.draggedTile = 'wall';
//         component.dragDropService.randomItemCounter = 0;
//         component.setItemType(0, 'item-aleatoire');
//         expect(component.tiles[0].item).toBe('');
//     });

//     it('placeTile should call setTileType', () => {
//         const setTileTypeSpy = spyOn(component, 'setTileType');
//         component.isMouseDown = true;
//         component.isLeftClick = true;
//         component.selectedTileType = 'wall';
//         component.selectedMode = CurrentMode.TileTool;
//         component.placeTile(0);
//         expect(setTileTypeSpy).toHaveBeenCalled();
//     });

//     it('placeTile should not call setTileType if isLeftClick is false', () => {
//         const setTileTypeSpy = spyOn(component, 'setTileType');
//         component.isMouseDown = true;
//         component.isLeftClick = false;
//         component.selectedTileType = 'wall';
//         component.selectedMode = CurrentMode.TileTool;
//         component.placeTile(0);
//         expect(setTileTypeSpy).not.toHaveBeenCalled();
//     });

//     it('placeTile should not call setTileType if isMouseDown is false', () => {
//         const setTileTypeSpy = spyOn(component, 'setTileType');
//         component.isMouseDown = false;
//         component.isLeftClick = true;
//         component.selectedTileType = 'wall';
//         component.selectedMode = CurrentMode.TileTool;
//         component.placeTile(0);
//         expect(setTileTypeSpy).not.toHaveBeenCalled();
//     });

//     it('startItemDrag sould set isDraggingItem to true set the draggedItem and register the index', () => {
//         component.tiles[0].item = 'item-aleatoire';
//         component.startItemDrag(0);
//         expect(component.isDraggingItem).toBeTrue();
//         expect(component.draggedItem).toBe('item-aleatoire');
//         expect(component.draggedFromIndex).toBe(0);
//     });

//     it('endItemDrag should set isDraggingItem to false and reset the draggedItem and draggedFromIndex', () => {
//         component.tiles[0].tileType = TileTypes.BASIC;
//         component.tiles[0].item = '';

//         component.isDraggingItem = true;
//         component.draggedItem = 'item-aleatoire';
//         component.draggedFromIndex = 0;

//         component.endItemDrag(1);
//         expect(component.isDraggingItem).toBeFalse();
//         expect(component.draggedItem).toBe('');
//         expect(component.draggedFromIndex).toBe(-1);
//     });

//     it('endItemDrag should not change the item if the tile is a wall', () => {
//         component.tiles[0].tileType = TileTypes.WALL;
//         component.tiles[0].item = '';

//         component.isDraggingItem = true;
//         component.draggedItem = 'item-aleatoire';
//         component.draggedFromIndex = 0;

//         component.endItemDrag(0);
//         expect(component.tiles[0].item).toBe('');
//         expect(component.isDraggingItem).toBeFalse();
//     });

//     it('endItemDrag should not change the item if the tile is a doorClosed', () => {
//         component.tiles[0].tileType = TileTypes.DOORCLOSED;
//         component.tiles[0].item = '';

//         component.isDraggingItem = true;
//         component.draggedItem = 'item-aleatoire';
//         component.draggedFromIndex = 0;

//         component.endItemDrag(0);
//         expect(component.tiles[0].item).toBe('');
//         expect(component.isDraggingItem).toBeFalse();
//     });

//     it('endItemDrag should not change the item if the tile is a doorOpen', () => {
//         component.tiles[0].tileType = TileTypes.DOOROPEN;
//         component.tiles[0].item = '';

//         component.isDraggingItem = true;
//         component.draggedItem = 'item-aleatoire';
//         component.draggedFromIndex = 0;

//         component.endItemDrag(0);
//         expect(component.tiles[0].item).toBe('');
//         expect(component.isDraggingItem).toBeFalse();
//     });

//     it('endItemDrag should not change the item if the tile is the same as the draggedFromIndex', () => {
//         component.tiles[0].tileType = TileTypes.BASIC;
//         component.tiles[0].item = 'item-aleatoire';

//         component.isDraggingItem = true;
//         component.draggedItem = 'item-aleatoire';
//         component.draggedFromIndex = 0;

//         component.endItemDrag(0);
//         expect(component.tiles[0].item).toBe('item-aleatoire');
//         expect(component.isDraggingItem).toBeFalse();
//     });

//     it('onMouseDown should set isMouseDown to true', () => {
//         const mockEvent = new MouseEvent('mousedown');
//         component.onMouseDown(0, mockEvent);
//         expect(component.isMouseDown).toBeTrue();
//     });

//     it('onMouseDown should call startItemDrag if the tile has an item', () => {
//         const startItemDragSpy = spyOn(component, 'startItemDrag');
//         component.tiles[0].item = 'item-aleatoire';
//         const mockEvent = new MouseEvent('mousedown');

//         component.onMouseDown(0, mockEvent);
//         expect(startItemDragSpy).toHaveBeenCalled();
//     });

//     it('onMouseDown should call placeTile if the tile has no item', () => {
//         const placeTileSpy = spyOn(component, 'placeTile');
//         component.tiles[0].item = '';
//         const mockEvent = new MouseEvent('mousedown');

//         component.onMouseDown(0, mockEvent);
//         expect(placeTileSpy).toHaveBeenCalled();
//     });

//     it('onMouseUp should set isMouseDown to false', () => {
//         const mockEvent = new MouseEvent('mouseup');
//         component.onMouseUp(0, mockEvent, '');
//         expect(component.isMouseDown).toBeFalse();
//     });

//     it('onMouseUp should set isLeftClick to false', () => {
//         const mockEvent = new MouseEvent('mouseup');
//         component.onMouseUp(0, mockEvent, '');
//         expect(component.isLeftClick).toBeFalse();
//     });

//     it('onMouseUp should call endItemDrag if isDraggingItem is true', () => {
//         const endItemDragSpy = spyOn(component, 'endItemDrag');
//         component.isDraggingItem = true;
//         const mockEvent = new MouseEvent('mouseup');

//         component.onMouseUp(0, mockEvent, '');
//         expect(endItemDragSpy).toHaveBeenCalled();
//     });

//     it('onMouseUp should call setItemType if isDraggingItem is false', () => {
//         const setItemTypeSpy = spyOn(component, 'setItemType');
//         component.isDraggingItem = false;
//         const mockEvent = new MouseEvent('mouseup');

//         component.onMouseUp(0, mockEvent, 'tile-aléatoire');
//         expect(setItemTypeSpy).toHaveBeenCalled();
//     });

//     it('onMouseEnter should call placeTile if isMouseDown is true and isLeftClick is true', () => {
//         const placeTileSpy = spyOn(component, 'placeTile');
//         const mockEvent = new MouseEvent('mouseenter');
//         component.isDraggingItem = false;
//         component.isMouseDown = true;
//         component.isLeftClick = true;
//         component.onMouseEnter(0, mockEvent);
//         expect(placeTileSpy).toHaveBeenCalled();
//     });

//     it('onMouseEnter should call deleteTile if isMouseDown is true and isLeftClick is false', () => {
//         const deleteTileSpy = spyOn(component, 'deleteTile');
//         const mockEvent = new MouseEvent('mouseenter');
//         component.isDraggingItem = false;
//         component.isMouseDown = true;
//         component.isLeftClick = false;
//         component.onMouseEnter(0, mockEvent);
//         expect(deleteTileSpy).toHaveBeenCalled();
//     });

//     it('onMouseEnter should not call placeTile if isDraggingItem is true', () => {
//         const placeTileSpy = spyOn(component, 'placeTile');
//         const mockEvent = new MouseEvent('mouseenter');
//         component.isDraggingItem = true;
//         component.isMouseDown = true;
//         component.isLeftClick = true;
//         component.onMouseEnter(0, mockEvent);
//         expect(placeTileSpy).not.toHaveBeenCalled();
//     });

//     it('onMouseEnter should not call deleteTile if isDraggingItem is true', () => {
//         const deleteTileSpy = spyOn(component, 'deleteTile');
//         const mockEvent = new MouseEvent('mouseenter');
//         component.isDraggingItem = true;
//         component.isMouseDown = true;
//         component.isLeftClick = false;
//         component.onMouseEnter(0, mockEvent);
//         expect(deleteTileSpy).not.toHaveBeenCalled();
//     });

//     it('onExit should set isMouseDown to false', () => {
//         component.isMouseDown = true;
//         component.onExit();
//         expect(component.isMouseDown).toBeFalse();
//     });

//     it('onExit should set isLeftClick to false', () => {
//         component.isLeftClick = true;
//         component.onExit();
//         expect(component.isLeftClick).toBeFalse();
//     });
// });

// describe('MapService', () => {
//     let service: MapService;

//     function randomTileIsBasic(tiles: TileJson[], gridLength: number) {
//         const randomIndex: number = Math.floor(Math.random() * gridLength);
//         const singleTile = {
//             idx: randomIndex, // Unique ID for each tile
//             tileType: TileTypes.BASIC, // Tile type
//             item: '',
//             hasPlayer: false,
//         } as TileJson;

//         const tileFromGrid = tiles[randomIndex];

//         return (
//             tileFromGrid.idx === singleTile.idx &&
//             tileFromGrid.tileType === singleTile.tileType &&
//             tileFromGrid.item === singleTile.item &&
//             tileFromGrid.hasPlayer === singleTile.hasPlayer
//         );
//     }

//     beforeEach(() => {
//         TestBed.configureTestingModule({ providers: [MapService] });
//         service = TestBed.inject(MapService);
//     });

//     it('should be created', () => {
//         expect(service).toBeTruthy();
//     });

//     it('createGrid should create a tileGrid of basic tiles with DEFAULT_MAP_SIZE if no parameter is given', () => {
//         const tiles = service.createGrid();
//         expect(tiles.length).toBe(DEFAULT_MAP_SIZE * DEFAULT_MAP_SIZE);
//         expect(randomTileIsBasic(tiles, DEFAULT_MAP_SIZE * DEFAULT_MAP_SIZE)).toBeTrue();
//     });

//     it('createGrid should create a tileGrid with a size equivalent to the square of the size given', () => {
//         const randomMapSize = Math.floor(Math.random() * DEFAULT_MAP_SIZE) + 1;
//         const tiles = service.createGrid(randomMapSize);
//         expect(tiles.length).toBe(randomMapSize * randomMapSize);
//         expect(randomTileIsBasic(tiles, randomMapSize * randomMapSize)).toBeTrue();
//     });

//     it('createGrid should throw an error when called with a negative number', function () {
//         expect(function () {
//             service.createGrid(-Math.floor(Math.random() * DEFAULT_MAP_SIZE));
//         }).toThrowError('MapSize must be a positive number.');
//     });

//     it('chooseTileType should return newTileType if not a door', () => {
//         const possibleCurrentTileType = ['', 'wall', 'doorOpen', 'doorClosed', 'water', 'ice'];
//         const possibleNewTileTypes = ['', 'wall', 'water', 'ice'];
//         const currentTileType = possibleCurrentTileType[Math.floor(Math.random() * possibleCurrentTileType.length)];
//         const newTileType = possibleNewTileTypes[Math.floor(Math.random() * possibleNewTileTypes.length)];

//         expect(service.chooseTileType(currentTileType, newTileType)).toBe(newTileType);
//     });

//     it('chooseTileType should return newTileType if not a door', () => {
//         const possibleCurrentTileType = ['', 'wall', 'doorOpen', 'doorClosed', 'water', 'ice'];
//         const possibleNewTileTypes = ['', 'wall', 'water', 'ice'];
//         const currentTileType = possibleCurrentTileType[Math.floor(Math.random() * possibleCurrentTileType.length)];
//         const newTileType = possibleNewTileTypes[Math.floor(Math.random() * possibleNewTileTypes.length)];

//         expect(service.chooseTileType(currentTileType, newTileType)).toBe(newTileType);
//     });

//     it('chooseTileType should return doorclosed if newTileType is door and current is not doorclosed', () => {
//         const possibleCurrentTileType = ['', 'wall', 'doorOpen', 'water', 'ice'];
//         const currentTileType = possibleCurrentTileType[Math.floor(Math.random() * possibleCurrentTileType.length)];
//         const newTileType = TileTypes.DOOR;

//         expect(service.chooseTileType(currentTileType, newTileType)).toBe(TileTypes.DOORCLOSED);
//     });

//     it('chooseTileType should return dooropen if newTileType is door and current is doorclosed', () => {
//         const currentTileType = TileTypes.DOORCLOSED;
//         const newTileType = TileTypes.DOOR;

//         expect(service.chooseTileType(currentTileType, newTileType)).toBe(TileTypes.DOOROPEN);
//     });
// });

// it('changeSelectedTile should set selectedTileType and selectedMode', () => {
//     component.selectedItem = 'test';
//     component.selectedTileType = '';
//     component.changeSelectedTile('test');
//     expect(component.selectedItem).toBe('');
//     expect(component.selectedTileType).toBe('test');
//     expect(component.selectedMode).toBe(CurrentMode.TileTool);
// });

// it('changeSelectedItem should set selectedItem and selectedMode', () => {
//     component.selectedItem = '';
//     component.selectedTileType = 'test';
//     component.changeSelectedItem('test');
//     expect(component.selectedItem).toBe('test');
//     expect(component.selectedTileType).toBe('');
//     expect(component.selectedMode).toBe(CurrentMode.ItemTool);
// });
