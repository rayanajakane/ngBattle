import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TileIceComponent } from './tile-ice.component';

describe('TileIceComponent', () => {
    let component: TileIceComponent;
    let fixture: ComponentFixture<TileIceComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TileIceComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TileIceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
