import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { AvatarSliderComponent } from './avatar-slider.component';

describe('AvatarSliderComponent', () => {
    let component: AvatarSliderComponent;
    let fixture: ComponentFixture<AvatarSliderComponent>;

    const mockElementRef = {
        nativeElement: {
            scrollLeft: 0,
            scrollRight: 0,
        },
    } as ElementRef;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AvatarSliderComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AvatarSliderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        mockElementRef.nativeElement.scrollRight = 0;
        mockElementRef.nativeElement.scrollLeft = 0;

        component.widgetsContent = mockElementRef;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should scroll left', () => {
        component.scrollLeft();
        // eslint-disable-next-line
        expect(component.widgetsContent.nativeElement.scrollLeft).toBe(-150);
    });

    it('should scroll right', () => {
        component.scrollRight();
        // eslint-disable-next-line
        expect(component.widgetsContent.nativeElement.scrollRight).toBe(150);
    });

    it('should select avatar', () => {
        const avatar = { name: 'Avatar 1', img: '../../test.png' };
        component.selectAvatar(avatar);
        expect(component.selectedAvatar).toEqual(avatar);
        expect(component.selectedAvatarEmitter).toHaveBeenCalled();
    });
});
