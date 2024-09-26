import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameSelectionPageComponent } from './game-selection-page.component';

import { ElementRef } from '@angular/core';

describe('GameSelectionPageComponent', () => {
    let component: GameSelectionPageComponent;
    let fixture: ComponentFixture<GameSelectionPageComponent>;

    const mockElementRef = {
        nativeElement: {
            scrollLeft: 0,
            scrollRight: 0,
        },
    } as ElementRef;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [GameSelectionPageComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GameSelectionPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        mockElementRef.nativeElement.scrollRight = 0;
        mockElementRef.nativeElement.scrollLeft = 0;

        component.widgetsContent = mockElementRef;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should scroll left', () => {
        component.scrollLeft();
        expect(component.widgetsContent.nativeElement.scrollLeft).toBe(-300);
    });

    it('should scroll right', () => {
        component.scrollRight();
        expect(component.widgetsContent.nativeElement.scrollRight).toBe(300);
    });
});
