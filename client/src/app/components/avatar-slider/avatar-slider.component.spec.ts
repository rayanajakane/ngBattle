import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvatarSliderComponent } from './avatar-slider.component';

describe('AvatarSliderComponent', () => {
    let component: AvatarSliderComponent;
    let fixture: ComponentFixture<AvatarSliderComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AvatarSliderComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AvatarSliderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
