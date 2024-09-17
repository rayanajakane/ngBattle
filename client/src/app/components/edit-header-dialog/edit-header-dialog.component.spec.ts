import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditHeaderDialogComponent } from './edit-header-dialog.component';

describe('EditHeaderDialogComponent', () => {
    let component: EditHeaderDialogComponent;
    let fixture: ComponentFixture<EditHeaderDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EditHeaderDialogComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(EditHeaderDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
