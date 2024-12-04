import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapPreviewComponent } from './map-preview.component';
/* eslint-disable */

describe('MapPreviewComponent', () => {
    let component: MapPreviewComponent;
    let fixture: ComponentFixture<MapPreviewComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MapPreviewComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(MapPreviewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
