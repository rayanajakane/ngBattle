import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConditionObject2Component } from './condition-object2.component';

describe('ConditionObject2Component', () => {
    let component: ConditionObject2Component;
    let fixture: ComponentFixture<ConditionObject2Component>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ConditionObject2Component],
        }).compileComponents();

        fixture = TestBed.createComponent(ConditionObject2Component);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
