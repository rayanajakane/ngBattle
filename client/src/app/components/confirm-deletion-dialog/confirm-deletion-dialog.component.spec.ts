import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { ConfirmDeletionDialogComponent } from './confirm-deletion-dialog.component';

describe('ConfirmDeletionDialogComponent', () => {
    let component: ConfirmDeletionDialogComponent;
    let fixture: ComponentFixture<ConfirmDeletionDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ConfirmDeletionDialogComponent],
            providers: [{ provide: MatDialogRef, useValue: {} }],
        }).compileComponents();

        fixture = TestBed.createComponent(ConfirmDeletionDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
