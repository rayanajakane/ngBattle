import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ItemTypes, TileTypes } from '@common/tile-types';
import { TileInfoModalComponent } from './tile-info-modal.component';

describe('TileInfoModalComponent', () => {
    let component: TileInfoModalComponent;
    let fixture: ComponentFixture<TileInfoModalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TileInfoModalComponent],
            providers: [{ provide: MAT_DIALOG_DATA, useValue: { tile: { tileType: TileTypes.WALL, item: ItemTypes.AA1 } } }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TileInfoModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set tileType correctly', () => {
        expect(component.tileType).toBe('Mur');
    });

    it('should set objectName correctly', () => {
        expect(component.objectName).toBe('Arme à feu');
    });

    it('should return correct tile type', () => {
        expect(component.chooseTileType(TileTypes.DOOR)).toBe('Porte');
        expect(component.chooseTileType(TileTypes.WATER)).toBe('Eau');
        expect(component.chooseTileType(TileTypes.ICE)).toBe('Glace');
        expect(component.chooseTileType(TileTypes.DOOROPEN)).toBe('Porte ouverte');
        expect(component.chooseTileType(TileTypes.DOORCLOSED)).toBe('Porte fermée');
        expect(component.chooseTileType(TileTypes.WALL)).toBe('Mur');
        expect(component.chooseTileType(TileTypes.BASIC)).toBe('Terrain');
        expect(component.chooseTileType('Unknown')).toBe('Terrain');
    });

    it('should return correct object name', () => {
        expect(component.chooseObjectName(ItemTypes.AA1)).toBe('Arme à feu');
        expect(component.chooseObjectName(ItemTypes.AA2)).toBe('Arme à feu 2');
        expect(component.chooseObjectName(ItemTypes.AC1)).toBe('Arme contondante');
        expect(component.chooseObjectName(ItemTypes.AC2)).toBe('Arme contondante 2');
        expect(component.chooseObjectName(ItemTypes.AF1)).toBe('Arme de jet');
        expect(component.chooseObjectName(ItemTypes.AF2)).toBe('Arme de jet 2');
        expect(component.chooseObjectName(ItemTypes.RANDOMITEM)).toBe('Objet aléatoire');
        expect(component.chooseObjectName(ItemTypes.STARTINGPOINT)).toBe('Point de départ');
        expect(component.chooseObjectName(ItemTypes.FLAGA)).toBe('Drapeau A');
        expect(component.chooseObjectName(ItemTypes.FLAGB)).toBe('Drapeau B');
        expect(component.chooseObjectName('Unknown')).toBe('Aucun objet');
    });
});
