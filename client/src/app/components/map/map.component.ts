import { Component, inject, Input, OnInit } from '@angular/core';
import { MatGridListModule, MatGridTile } from '@angular/material/grid-list';
import { DEFAULT_MAP_SIZE } from '@app/components/map/constants';
import { TileBasicComponent } from '@app/components/map/tile-basic/tile-basic.component';
import { currentMode } from '@app/data-structure/editViewSelectedMode';
import { TileJson } from '@app/data-structure/game-structure';
import { TileTypes } from '@app/data-structure/toolType';
import { DragDropService } from '@app/services/drag-drop.service';
import { MapService } from '@app/services/map.service';

@Component({
    selector: 'app-map',
    standalone: true,
    imports: [MatGridListModule, MatGridTile, TileBasicComponent],
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
    @Input() mapSize: number = DEFAULT_MAP_SIZE;
    @Input() selectedTileType: string;
    @Input() selectedItem: string;
    @Input() selectedMode: currentMode;

    tiles: TileJson[];
    oldTiles: TileJson[];

    isMouseDown = false;
    isLeftClick = false;

    mapService = inject(MapService);
    dragDropService = inject(DragDropService);

    // To save temporary item when draging from one tile to another in map
    draggedItem: string | null = null;
    draggedFromIndex: number | null = null;

    ngOnInit(): void {
        this.tiles = this.mapService.createGrid(this.mapSize);
        this.oldTiles = JSON.parse(JSON.stringify(this.tiles)); // Deep copy
        this.dragDropService.setMultipleItemCounter(this.mapSize);
    }

    resetGridToBasic() {
        this.tiles = JSON.parse(JSON.stringify(this.oldTiles)); // Deep copy
    }

    // Function to automatically change the tile's type
    setTileType(index: number, tileType: string) {
        const currentTileType = this.tiles[index].tileType;
        if (tileType == TileTypes.WALL || tileType == TileTypes.DOOR) {
            this.deleteItem(index);
        }
        tileType = this.mapService.chooseTileType(currentTileType, tileType);
        this.tiles[index].tileType = tileType;
    }

    setItemType(index: number, itemType: string) {
        if (
            this.tiles[index].tileType === TileTypes.WALL ||
            this.tiles[index].tileType === TileTypes.DOORCLOSED ||
            this.tiles[index].tileType === TileTypes.DOOROPEN ||
            this.dragDropService.draggedTile == ''
        ) {
            return;
        }

        // decerease counter when starting points or random items are added
        if (itemType === 'point-depart' && !(this.tiles[index].item === 'point-depart')) {
            this.dragDropService.reduceNumberStartingPoints();
        }
        if (itemType === 'item-aleatoire' && !(this.tiles[index].item === 'item-aleatoire')) {
            this.dragDropService.reduceNumberRandomItem();
        }
        this.tiles[index].item = itemType;
        this.dragDropService.resetDraggedObject();
    }

    deleteItem(index: number) {
        if (this.tiles[index].item === 'point-depart') {
            this.dragDropService.incrementNumberStartingPoints();
        } else if (this.tiles[index].item === 'item-aleatoire') {
            this.dragDropService.incrementNumberRandomItem();
        }
        this.tiles[index].item = '';
    }

    deleteTile(index: number) {
        this.tiles[index].tileType = TileTypes.BASIC;
    }

    delete(index: number) {
        if (this.tiles[index].item != '') {
            this.deleteItem(index);
        } else {
            this.deleteTile(index);
        }
    }

    placeTile(index: number) {
        console.log('placeTile');
        if (this.isMouseDown && this.isLeftClick && this.selectedTileType != '' && this.selectedMode == currentMode.TILETOOL) {
            this.setTileType(index, this.selectedTileType);
        }
    }

    onMouseDown(event: MouseEvent, index: number) {
        console.log('onMouseDown');
        this.isMouseDown = true;
        if (event.button == 0) {
            this.isLeftClick = true;
            this.placeTile(index);
        } else {
            this.delete(index);
        }
    }

    onMouseUp(index: number, event: MouseEvent, draggedTile: string) {
        console.log('onMouseUp');
        this.isMouseDown = false;
        this.isLeftClick = false;
        if (event.button == 0) {
            this.setItemType(index, draggedTile);
        } else {
            this.delete(index);
        }
    }

    onMouseEnter(index: number, event: MouseEvent) {
        console.log('onMouseEnter');
        if (this.isMouseDown && this.isLeftClick) {
            this.placeTile(index);
        } else if (this.isMouseDown && !this.isLeftClick) {
            this.delete(index);
        }
    }

    onExit() {
        this.isMouseDown = false;
        this.isLeftClick = false;
    }

    returnMapSize(): number {
        return this.mapSize;
    }

    onDragStart(item: string, index: number): void {
        this.draggedItem = item;
        this.draggedFromIndex = index;
    }

    onDrop(event: Event, dropIndex: number): void {
        event.preventDefault();

        if (this.draggedItem !== null && this.draggedFromIndex !== null) {
            this.tiles[dropIndex].item = this.draggedItem;
            this.tiles[this.draggedFromIndex].item = '';
        }

        this.draggedItem = null;
        this.draggedFromIndex = null;
    }
}
