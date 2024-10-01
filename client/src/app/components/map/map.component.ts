import { Component, inject, Input, OnInit } from '@angular/core';
import { MatGridListModule, MatGridTile } from '@angular/material/grid-list';
import { DEFAULT_MAP_SIZE } from '@app/components/map/constants';
import { TileBasicComponent } from '@app/components/map/tile-basic/tile-basic.component';
import { CurrentMode } from '@app/data-structure/editViewSelectedMode';
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
    @Input() selectedMode: CurrentMode;

    tiles: TileJson[];
    oldTiles: TileJson[];

    isMouseDown = false;
    isLeftClick = false;
    isDraggingItem = false;

    mapService = inject(MapService);
    dragDropService = inject(DragDropService);

    // To save temporary item when draging from one tile to another in map
    draggedItem: string = '';
    draggedFromIndex: number = -1;

    ngOnInit(): void {
        if (!this.tiles) {
            this.tiles = this.mapService.createGrid(this.mapSize);
        }
        this.oldTiles = JSON.parse(JSON.stringify(this.tiles)); // Deep copy
        this.dragDropService.setMultipleItemCounter(this.mapSize);
    }

    resetGridToBasic() {
        this.tiles = JSON.parse(JSON.stringify(this.oldTiles)); // Deep copy
        this.dragDropService.setMultipleItemCounter(this.mapSize);
    }

    /**
     * Sets the type of a tile at a specified index. If the new tile type is a wall or door,
     * the item at the index is deleted before setting the new tile type.
     *
     * @param index - The index of the tile to be updated.
     * @param tileType - The new type to set for the tile.
     */
    setTileType(index: number, tileType: string) {
        const currentTileType = this.tiles[index].tileType;
        if (tileType === TileTypes.WALL || tileType === TileTypes.DOOR) {
            this.deleteItem(index);
        }
        tileType = this.mapService.chooseTileType(currentTileType, tileType);
        this.tiles[index].tileType = tileType;
    }

    /**
     * Sets the item type for a specific tile at the given index.
     *
     * @param index - The index of the tile to set the item type for.
     * @param itemType - The type of item to set for the tile.
     *
     * This method performs the following actions:
     * - Checks if the tile is of type WALL, DOORCLOSED, DOOROPEN, or if there is no dragged tile. If any of these conditions are met, the method returns early.
     * - If the item type is 'startingPoint' and the current item is not 'startingPoint', it decreases the counter for starting points.
     * - If the item type is 'item-aleatoire' and the current item is not 'item-aleatoire', it decreases the counter for random items.
     * - Sets the item type for the tile at the specified index.
     * - Resets the dragged object in the dragDropService.
     */
    setItemType(index: number, itemType: string) {
        if (
            this.tiles[index].tileType === TileTypes.WALL ||
            this.tiles[index].tileType === TileTypes.DOORCLOSED ||
            this.tiles[index].tileType === TileTypes.DOOROPEN ||
            this.dragDropService.draggedTile === '' ||
            (itemType === 'startingPoint' && this.dragDropService.startingPointNumberCounter === 0) ||
            (itemType === 'item-aleatoire' && this.dragDropService.randomItemCounter === 0)
        ) {
            return;
        }
        // decerease counter when starting points or random items are added
        if (itemType === 'startingPoint' && !(this.tiles[index].item === 'startingPoint')) {
            this.dragDropService.reduceNumberStartingPoints();
        }
        if (itemType === 'item-aleatoire' && !(this.tiles[index].item === 'item-aleatoire')) {
            this.dragDropService.reduceNumberRandomItem();
        }
        this.tiles[index].item = itemType;
        this.dragDropService.resetDraggedObject();
    }

    deleteItem(index: number) {
        if (this.tiles[index].item === 'startingPoint') {
            this.dragDropService.incrementNumberStartingPoints();
        } else if (this.tiles[index].item === 'item-aleatoire') {
            this.dragDropService.incrementNumberRandomItem();
        }
        this.tiles[index].item = '';
    }

    deleteTile(index: number) {
        this.tiles[index].tileType = TileTypes.BASIC;
    }

    /**
     * Deletes an item or tile at the specified index.
     *
     * If the item at the given index is not an empty string, it deletes the item.
     * Otherwise, it deletes the tile.
     *
     * @param index - The index of the item or tile to delete.
     */
    delete(index: number) {
        if (this.tiles[index].item !== '') {
            this.deleteItem(index);
        } else {
            this.deleteTile(index);
        }
    }

    placeTile(index: number) {
        if (this.isMouseDown && this.isLeftClick && this.selectedTileType !== '' && this.selectedMode === CurrentMode.TileTool) {
            this.setTileType(index, this.selectedTileType);
        }
    }

    /**
     * Initiates the dragging process for an item in the tiles array.
     *
     * @param index - The index of the item in the tiles array that is being dragged.
     */
    startItemDrag(index: number) {
        this.isDraggingItem = true;
        this.draggedItem = this.tiles[index].item;
        this.draggedFromIndex = index;
    }

    /**
     * Ends the dragging of an item and places it on a new tile if the conditions are met.
     *
     * @param index - The index of the tile where the item is being dropped.
     *
     * The function checks if the tile at the given index is not a wall or door and is not the same tile from which the item was dragged.
     * If these conditions are met, the item is placed on the new tile, and the original tile is cleared.
     * The dragging state is then reset.
     */
    endItemDrag(index: number) {
        // check if the tile is not a wall or door and not the same tile from which the item is dragged
        if (
            this.tiles[index].tileType !== TileTypes.WALL &&
            this.tiles[index].tileType !== TileTypes.DOORCLOSED &&
            this.tiles[index].tileType !== TileTypes.DOOROPEN &&
            this.tiles[index].item === '' &&
            index !== this.draggedFromIndex
        ) {
            this.tiles[index].item = this.draggedItem;
            this.tiles[this.draggedFromIndex].item = '';
            this.draggedItem = '';
            this.draggedFromIndex = -1;
        }
        this.isDraggingItem = false;
    }

    /**
     * Handles the mouse down event on a tile.
     *
     * @param index - The index of the tile where the mouse down event occurred.
     * @param event - The mouse event object.
     *
     * This method prevents the default action and stops the propagation of the event.
     * It sets the `isMouseDown` flag to true.
     *
     * If the left mouse button (button 0) is pressed:
     * - If the tile at the given index contains an item, it starts dragging the item.
     * - Otherwise, it sets the `isLeftClick` flag to true and places a tile at the given index.
     */
    onMouseDown(index: number, event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isMouseDown = true;

        if (event.button === 0) {
            // priority to drag item from one tile to another
            if (this.tiles[index].item !== '') {
                this.startItemDrag(index);
                return;
            }

            this.isLeftClick = true;
            this.placeTile(index);
        }
    }

    /**
     * Handles the mouse up event on a tile.
     *
     * @param index - The index of the tile where the mouse up event occurred.
     * @param event - The mouse event object.
     * @param draggedTile - The type of the tile being dragged.
     *
     * @remarks
     * This method prevents the default behavior and propagation of the mouse event.
     * It also handles the end of a drag operation if dragging is in progress.
     * If the left mouse button is released, it sets the item type for the specified tile.
     */
    onMouseUp(index: number, event: MouseEvent, draggedTile: string) {
        event.preventDefault();
        event.stopPropagation();
        this.isMouseDown = false;
        this.isLeftClick = false;
        // to drag item from one tile to another
        if (this.isDraggingItem) {
            this.endItemDrag(index);
            return;
        }

        if (event.button === 0) this.setItemType(index, draggedTile);
    }

    /**
     * Handles the mouse enter event on a tile.
     *
     * @param index - The index of the tile being interacted with.
     * @param event - The mouse event triggered by entering the tile.
     *
     * Prevents the default behavior and stops propagation of the event.
     * If not dragging, places or deletes a tile based on the mouse button pressed.
     */
    onMouseEnter(index: number, event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();

        // ignore placement or deletion if dragging item from one tile to another
        if (!this.isDraggingItem) {
            if (this.isMouseDown && this.isLeftClick) {
                this.placeTile(index);
            } else if (this.isMouseDown && !this.isLeftClick) {
                this.deleteTile(index);
            }
        }
    }

    onExit() {
        this.isMouseDown = false;
        this.isLeftClick = false;
    }
}
