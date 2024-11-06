import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TileBasicComponent } from './tile-basic.component';

describe('TileBasicComponent', () => {
    let component: TileBasicComponent;
    let fixture: ComponentFixture<TileBasicComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TileBasicComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TileBasicComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // TODO: check for random itemType once assets are added
    it('setItemImage should change transparentImage based on itemType', () => {
        const itemTypes = ['AA1', 'AA2', 'AC1', 'AC2', 'AF1', 'AF2', 'item-aleatoire', 'startingPoint', 'drapeauA', 'drapeauB'];
        component.itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        component.setItemImage();
        expect(component.transparentImage).toBe(`./assets/${component.itemType}_transparent.png`);
        component.itemType = '';
        component.setItemImage();
        expect(component.transparentImage).toBe('');
    });

    it('setTileImage should change imageUrl based on itemType', () => {
        const tileTypes = ['wall', 'doorOpen', 'doorClosed', 'water', 'ice'];
        component.tileType = tileTypes[Math.floor(Math.random() * tileTypes.length)];
        component.setTileImage();
        expect(component.imageUrl).toBe(`./assets/${component.tileType}.jpg`);
        component.tileType = '';
        component.setTileImage();
        expect(component.imageUrl).toBe('./assets/ground.jpg');
    });
});
