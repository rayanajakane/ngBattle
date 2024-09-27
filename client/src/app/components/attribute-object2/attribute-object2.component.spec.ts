import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributeObject2Component } from './attribute-object2.component';

describe('AttributeObject2Component', () => {
    let component: AttributeObject2Component;
    let fixture: ComponentFixture<AttributeObject2Component>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AttributeObject2Component],
        }).compileComponents();

        fixture = TestBed.createComponent(AttributeObject2Component);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
