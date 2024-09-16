import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TileDoorComponent } from './tile-door.component';

describe('TileDoorComponent', () => {
    let component: TileDoorComponent;
    let fixture: ComponentFixture<TileDoorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TileDoorComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TileDoorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
