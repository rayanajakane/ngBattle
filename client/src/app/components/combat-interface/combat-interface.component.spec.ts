import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CombatInterfaceComponent } from './combat-interface.component';

describe('CombatInterfaceComponent', () => {
    let component: CombatInterfaceComponent;
    let fixture: ComponentFixture<CombatInterfaceComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CombatInterfaceComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CombatInterfaceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
