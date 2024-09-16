import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminItemComponent } from './admin-item.component';

describe('AdminItemComponent', () => {
    let component: AdminItemComponent;
    let fixture: ComponentFixture<AdminItemComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AdminItemComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AdminItemComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        component.item = {
            visibility: true,
        };
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should toggle visibility', () => {
        component.invertVisibility();
        expect(component.item.visibility).toBeFalse();
    });
});
