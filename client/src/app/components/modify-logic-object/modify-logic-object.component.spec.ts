import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyLogicObjectComponent } from './modify-logic-object.component';

describe('ModifyLogicObjectComponent', () => {
    let component: ModifyLogicObjectComponent;
    let fixture: ComponentFixture<ModifyLogicObjectComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ModifyLogicObjectComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ModifyLogicObjectComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
