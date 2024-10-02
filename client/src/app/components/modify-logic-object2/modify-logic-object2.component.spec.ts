import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyLogicObject2Component } from './modify-logic-object2.component';

describe('ModifyLogicObject2Component', () => {
    let component: ModifyLogicObject2Component;
    let fixture: ComponentFixture<ModifyLogicObject2Component>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ModifyLogicObject2Component],
        }).compileComponents();

        fixture = TestBed.createComponent(ModifyLogicObject2Component);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
