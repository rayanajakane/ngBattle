import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EditHeaderDialogComponent } from './edit-header-dialog.component';

describe('EditHeaderDialogComponent', () => {
    let component: EditHeaderDialogComponent;
    let fixture: ComponentFixture<EditHeaderDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EditHeaderDialogComponent, NoopAnimationsModule],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(EditHeaderDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
