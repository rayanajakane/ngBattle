import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TileInfoModalComponent } from './tile-info-modal.component';

describe('TileInfoModalComponent', () => {
    let component: TileInfoModalComponent;
    let fixture: ComponentFixture<TileInfoModalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TileInfoModalComponent],
            providers: [
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: { tile: { tileType: 'WALL', item: 'AA1' } },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(TileInfoModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
