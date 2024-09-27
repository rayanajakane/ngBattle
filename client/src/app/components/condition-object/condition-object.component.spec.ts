import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConditionObjectComponent } from './condition-object.component';

describe('ConditionObjectComponent', () => {
    let component: ConditionObjectComponent;
    let fixture: ComponentFixture<ConditionObjectComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ConditionObjectComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ConditionObjectComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
