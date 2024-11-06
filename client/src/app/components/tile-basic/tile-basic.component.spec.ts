import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemTypes } from '@app/data-structure/toolType';
import { TilePreview } from '@common/game-structure';
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

    it('setItemImage should change transparentImage based on itemType', () => {
        const itemTypes: ItemTypes[] = [
            ItemTypes.AA1,
            ItemTypes.AA2,
            ItemTypes.AC1,
            ItemTypes.AC2,
            ItemTypes.AF1,
            ItemTypes.AF2,
            ItemTypes.RANDOMITEM,
            ItemTypes.STARTINGPOINT,
            ItemTypes.FLAGA,
            ItemTypes.FLAGB,
        ];
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

    it('should choosePreview class based on isAccessible', () => {
        expect(component.choosePreviewClass()).toBe('');
        component.isAccessible = TilePreview.PREVIEW;
        expect(component.choosePreviewClass()).toBe('previsualize');
        component.isAccessible = TilePreview.SHORTESTPATH;
        expect(component.choosePreviewClass()).toBe('shortestPath');
    });
    it('setAvatarImage should change avatarUrl based on avatar', () => {
        const avatars = ['hero', 'villain', 'npc'];
        component.avatar = avatars[Math.floor(Math.random() * avatars.length)];
        component.setAvatarImage();
        expect(component.avatarUrl).toBe(`./../../../assets/characters/${component.avatar}.png`);
        component.avatar = '';
        component.setAvatarImage();
        expect(component.avatarUrl).toBe('');
    });
});
