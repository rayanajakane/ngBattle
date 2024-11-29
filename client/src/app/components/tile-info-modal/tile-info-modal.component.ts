import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GameTile } from '@common/game-structure';
import { ItemTypes, TileTypes } from '@common/tile-types';

@Component({
    selector: 'app-tile-info-modal',
    templateUrl: './tile-info-modal.component.html',
})
export class TileInfoModalComponent {
    tileType: string;
    objectName: string;
    objectDescription: string;
    avatarName: string;
    tileCost: string;
    tileEffect: string;
    objectEffect: string;

    constructor(@Inject(MAT_DIALOG_DATA) public data: { tile: GameTile }) {
        this.tileType = this.chooseTileType(this.data.tile.tileType);
        this.objectName = this.chooseObjectName(this.data.tile.item);
    }

    // TODO : add the cost and effect of each tile ( object & tile effect)
    // TODO : add the correct path for the avatar
    chooseTileType(tileType: string) {
        switch (tileType) {
            case TileTypes.WALL:
                return 'Mur';
            case TileTypes.DOOR:
                return 'Porte';
            case TileTypes.DOOROPEN:
                return 'Porte ouverte';
            case TileTypes.DOORCLOSED:
                return 'Porte fermée';
            case TileTypes.WATER:
                return 'Eau';
            case TileTypes.ICE:
                return 'Glace';
            default:
                return 'Terrain';
        }
    }
    chooseObjectName(item: string) {
        switch (item) {
            case ItemTypes.AA1:
                return 'Arme à feu';
            case ItemTypes.AA2:
                return 'Arme à feu 2';
            case ItemTypes.AC1:
                return 'Arme contondante';
            case ItemTypes.AC2:
                return 'Arme contondante 2';
            case ItemTypes.AF1:
                return 'Arme de jet';
            case ItemTypes.AF2:
                return 'Arme de jet 2';
            case ItemTypes.RANDOMITEM:
                return 'Objet aléatoire';
            case ItemTypes.STARTINGPOINT:
                return 'Point de départ';
            case ItemTypes.FLAG_A:
                return 'Drapeau A';
            case ItemTypes.FLAG_B:
                return 'Drapeau B';
            default:
                return 'Aucun objet';
        }
    }
}
