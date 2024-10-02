import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartingPointObjectComponent } from './starting-point-object.component';

describe('StartingPointObjectComponent', () => {
    let component: StartingPointObjectComponent;
    let fixture: ComponentFixture<StartingPointObjectComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StartingPointObjectComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(StartingPointObjectComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
