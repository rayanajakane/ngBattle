import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GameTile } from '@common/game-structure';
import { TileTypes } from '@common/tile-types';

@Component({
    selector: 'app-tile-info-modal',
    templateUrl: './tile-info-modal.component.html',
})
export class TileInfoModalComponent implements OnInit {
    tileType: string;
    objectName: string;
    objectDescription: string;
    avatarName: string;
    tileCost: string;
    tileEffect: string;
    objectEffect: string;

    constructor(@Inject(MAT_DIALOG_DATA) public data: { tile: GameTile }) {}

    // TODO : add the cost and effect of each tile ( object & tile effect)
    // TODO : add the correct path for the avatar
    ngOnInit() {
        // Set the tile type
        switch (this.data.tile.tileType) {
            case TileTypes.WALL:
                this.tileType = 'Mur frl';
                break;
            case TileTypes.DOOR:
                this.tileType = 'Porte';
                break;
            case TileTypes.WATER:
                this.tileType = 'Eau';
                break;
            case TileTypes.ICE:
                this.tileType = 'Glace';
                break;
        }
        // Set the object names
        switch (this.data.tile.item) {
            case 'AA1':
                this.objectName = 'Arme à feu';
                break;
            case 'AA2':
                this.objectName = 'Arme à feu 2';
                break;
            case 'AC1':
                this.objectName = 'Arme contondante';
                break;
            case 'AC2':
                this.objectName = 'Arme contondante 2';
                break;
            case 'AF1':
                this.objectName = 'Arme de jet';
                break;
            case 'AF2':
                this.objectName = 'Arme de jet 2';
                break;
            case 'item-aleatoire':
                this.objectName = 'Objet aléatoire';
                break;
            case 'startingPoint':
                this.objectName = 'Point de départ';
                break;
            case 'drapeau-A':
                this.objectName = 'Drapeau A';
                break;
            case 'drapeau-B':
                this.objectName = 'Drapeau B';
                break;
            default:
                this.objectName = 'Aucun objet';
                break;
        }
    }
}
