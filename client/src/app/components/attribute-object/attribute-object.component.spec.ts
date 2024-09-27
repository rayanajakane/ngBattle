import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributeObjectComponent } from './attribute-object.component';

describe('AttributeObjectComponent', () => {
    let component: AttributeObjectComponent;
    let fixture: ComponentFixture<AttributeObjectComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AttributeObjectComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AttributeObjectComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
