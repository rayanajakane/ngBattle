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
    isRightClick = false;

    mapService = inject(MapService);
    dragDropService = inject(DragDropService);

    ngOnInit(): void {
        this.tiles = this.mapService.createGrid(this.mapSize);
        this.oldTiles = JSON.parse(JSON.stringify(this.tiles)); // Deep copy
        this.dragDropService.setMultipleItemCounter(this.mapSize);
    }

    resetGridToBasic() {
        this.tiles = JSON.parse(JSON.stringify(this.oldTiles)); // Deep copy
    }

    // Function to automatically change the tile's type

    // TODO: erase Item if it is not allowed on the new tileType
    setTileType(index: number, tileType: string) {
        const currentTileType = this.tiles[index].tileType;
        if (tileType == TileTypes.WALL || tileType == TileTypes.DOOR) {
            this.eraseItem(index);
        }
        tileType = this.mapService.chooseTileType(currentTileType, tileType);
        this.tiles[index].tileType = tileType;
        if (tileType === TileTypes.DOOR || TileTypes.WALL) {
            this.tiles[index].item = '';
        }
    }

    setItemType(index: number, itemType: string) {
        if (this.dragDropService.draggedTile == '') {
            return;
        }
        if (itemType === 'point-depart') {
            if (this.dragDropService.startingPointNumberCounter === 0 || this.tiles[index].item === 'point-depart') {
                return;
            } else {
                this.dragDropService.reduceNumberStartingPoints();
            }
        }
        if (itemType === 'item-aleatoire') {
            if (this.dragDropService.randomItemCounter === 0 || this.tiles[index].item === 'item-aleatoire') {
                return;
            } else {
                this.dragDropService.reduceNumberRandomItem();
            }
        }
        if (
            this.tiles[index].tileType === TileTypes.WALL ||
            this.tiles[index].tileType === TileTypes.DOORCLOSED ||
            this.tiles[index].tileType === TileTypes.DOOROPEN
        ) {
            return;
        }
        this.tiles[index].item = itemType;
        console.log('item at index:', index, this.tiles[index].item);
        this.dragDropService.resetDraggedObject();
    }

    // TODO: reincrement counters when starting points or random items are deleted
    eraseItem(index: number) {
        this.tiles[index].item = '';
    }

    onMouseDown(event: MouseEvent, index: number) {
        if (event.button === 2) {
            // erase item only and no drag
            if (this.tiles[index].item != '') {
                this.isRightClick = true;
            } else {
                // erase tile and drag
                this.isRightClick = true;
                this.isMouseDown = true;
                this.setTileType(index, TileTypes.BASIC);
            }
        } else {
            if (this.selectedTileType != '') {
                this.isMouseDown = true;
                this.setTileType(index, this.selectedTileType);
            } else {
                this.setItemType(index, this.selectedItem);
            }
        }
    }

    onMouseEnter(index: number) {
        if (this.isMouseDown) {
            if (this.isRightClick) {
                this.setTileType(index, TileTypes.BASIC);
            } else {
                this.setTileType(index, this.selectedTileType);
            }
        }
    }

    onMouseUp(index: number) {
        if (this.isMouseDown) {
            this.isMouseDown = false;
            this.isRightClick = false;
        } else {
            // right clicked on without isMouseDown
            if (this.isRightClick) {
                this.isRightClick = false;
                this.eraseItem(index);
            }
        }
    }

    onExit() {
        this.isMouseDown = false;
        this.isRightClick = false;
    }

    returnMapSize(): number {
        return this.mapSize;
    }
}
