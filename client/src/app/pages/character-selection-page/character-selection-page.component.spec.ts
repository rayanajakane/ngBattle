import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterSelectionPageComponent } from './character-selection-page.component';

import { ElementRef } from '@angular/core';
import { HttpClientService } from '@app/services/httpclient.service';
describe('CharacterSelectionPageComponent', () => {
    let component: CharacterSelectionPageComponent;
    let fixture: ComponentFixture<CharacterSelectionPageComponent>;

    const mockElementRef = {
        nativeElement: {
            scrollLeft: 0,
            scrollRight: 0,
        },
    } as ElementRef;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CharacterSelectionPageComponent, HttpClientService],
        }).compileComponents();

        fixture = TestBed.createComponent(CharacterSelectionPageComponent);
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
        // eslint-disable-next-line
        expect(component.widgetsContent.nativeElement.scrollLeft).toBe(-150);
    });

    it('should scroll right', () => {
        component.scrollRight();
        // eslint-disable-next-line
        expect(component.widgetsContent.nativeElement.scrollRight).toBe(150);
    });

    it('should select an avatar', () => {
        const avatar = { name: 'Avatar 1', img: '../../../assets/characters/1.png' };
        component.selectAvatar(avatar);
        expect(component.selectedAvatar).toEqual(avatar);
    });

    it('should add bonus speed', () => {
        const speed = component.speed;
        component.addBonus('speed');
        expect(component.speed).toBe(speed + 2);
    });

    it('should add bonus life', () => {
        const life = component.life;
        component.addBonus('life');
        expect(component.life).toBe(life + 2);
    });

    it('should assign dice', () => {
        const event = {
            target: {
                value: 'attack',
            },
        } as unknown as Event;
        component.assignDice(event);
        // eslint-disable-next-line
        expect(component.selectedDice.attack).toBe(6);
        // eslint-disable-next-line
        expect(component.selectedDice.defense).toBe(4);
    });

    it('should assign dice', () => {
        const event = {
            target: {
                value: 'defense',
            },
        } as unknown as Event;
        component.assignDice(event);
        // eslint-disable-next-line
        expect(component.selectedDice.attack).toBe(4);
        // eslint-disable-next-line
        expect(component.selectedDice.defense).toBe(6);
    });
});
