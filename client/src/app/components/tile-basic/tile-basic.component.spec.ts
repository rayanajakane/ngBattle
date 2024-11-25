import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TilePreview } from '@common/game-structure';
import { ItemTypes } from '@common/tile-types';
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
        const avatars = [
            'Avatar 1',
            'Avatar 2',
            'Avatar 3',
            'Avatar 4',
            'Avatar 5',
            'Avatar 6',
            'Avatar 7',
            'Avatar 8',
            'Avatar 9',
            'Avatar 10',
            'Avatar 11',
            'Avatar 12',
        ];
        component.avatar = avatars[Math.floor(Math.random() * avatars.length)];
        component.setAvatarImage();
        expect(component.avatarUrl).toBe('./../../../assets/characters/' + component.chooseAvatar(component.avatar) + '.png');
        component.avatar = '';
        component.setAvatarImage();
        expect(component.avatarUrl).toBe('');
    });

    it('ngOnChanges should call setTileImage, setItemImage, choosePreviewClass, and setAvatarImage', () => {
        spyOn(component, 'setTileImage');
        spyOn(component, 'setItemImage');
        spyOn(component, 'choosePreviewClass');
        spyOn(component, 'setAvatarImage');

        component.ngOnChanges();

        expect(component.setTileImage).toHaveBeenCalled();
        expect(component.setItemImage).toHaveBeenCalled();
        expect(component.choosePreviewClass).toHaveBeenCalled();
        expect(component.setAvatarImage).toHaveBeenCalled();
    });

    it('chooseAvatar should return correct avatar number', () => {
        expect(component.chooseAvatar('Avatar 1')).toBe('1');
        expect(component.chooseAvatar('Avatar 2')).toBe('2');
        expect(component.chooseAvatar('Avatar 3')).toBe('3');
        expect(component.chooseAvatar('Avatar 4')).toBe('4');
        expect(component.chooseAvatar('Avatar 5')).toBe('5');
        expect(component.chooseAvatar('Avatar 6')).toBe('6');
        expect(component.chooseAvatar('Avatar 7')).toBe('7');
        expect(component.chooseAvatar('Avatar 8')).toBe('8');
        expect(component.chooseAvatar('Avatar 9')).toBe('9');
        expect(component.chooseAvatar('Avatar 10')).toBe('10');
        expect(component.chooseAvatar('Avatar 11')).toBe('11');
        expect(component.chooseAvatar('Avatar 12')).toBe('12');
        expect(component.chooseAvatar('Unknown Avatar')).toBe('');
    });
});
