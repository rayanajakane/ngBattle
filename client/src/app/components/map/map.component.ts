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

    // onMouseDown(event: MouseEvent, index: number) {
    //     if (this.selectedTileType != TileTypes.BASIC) {
    //         this.mapService.onMouseDown(event, index, this.selectedTileType);
    //     } else if (this.selectedItem != '') {
    //         console.log('nice');
    //         //TODO: change behavior depending on selected Item/TileType
    //     }
    // }

    resetGridToBasic() {
        this.tiles = JSON.parse(JSON.stringify(this.oldTiles)); // Deep copy
    }

    // Function to automatically change the tile's type
    setTileType(index: number, tileType: string) {
        const currentTileType = this.tiles[index].tileType;
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

    // Triggered when the mouse button is pressed
    onMouseDown(event: MouseEvent, index: number) {
        if (event.button === 2 && this.tiles[index].item != '') {
            this.tiles[index].item = '';
        } else if (this.selectedMode == currentMode.TILETOOL) {
            this.isMouseDown = true;
            if (event.button === 2) {
                this.isRightClick = true;
                this.setTileType(index, TileTypes.BASIC);
            } else {
                this.setTileType(index, this.selectedTileType);
            }
        }
    }

    newOnMouseDown(event: MouseEvent, index: number) {
        if (event.button === 2) {
        } else {
            this.isMouseDown = true;
        }
    }

    // Triggered when the mouse button is released
    onMouseUp(index: number) {
        if (this.selectedMode == currentMode.ITEMTOOL) {
            this.setItemType(index, this.selectedItem);
        }
        this.isMouseDown = false;
        this.isRightClick = false;
    }

    // Triggered when the mouse enters a tile while pressed
    onMouseEnter(index: number) {
        if (this.isMouseDown) {
            this.setTileType(index, !this.isRightClick ? this.selectedTileType : TileTypes.BASIC);
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
