import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartingPointComponent } from './starting-point.component';

describe('StartingPointComponent', () => {
    let component: StartingPointComponent;
    let fixture: ComponentFixture<StartingPointComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [StartingPointComponent] }).compileComponents();
        fixture = TestBed.createComponent(StartingPointComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
