import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterSelectionDialogComponent } from './character-selection-dialog.component';

describe('CharacterSelectionDialogComponent', () => {
    let component: CharacterSelectionDialogComponent;
    let fixture: ComponentFixture<CharacterSelectionDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CharacterSelectionDialogComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CharacterSelectionDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
