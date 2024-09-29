import { HttpClientModule } from '@angular/common/http';
import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { HttpClientService } from '@app/services/httpclient.service';
import { CharacterSelectionPageComponent, DialogDataComponent } from './character-selection-page.component';
/* eslint-disable @typescript-eslint/no-explicit-any */
describe('CharacterSelectionPageComponent', () => {
    let component: CharacterSelectionPageComponent;
    let dialogDataComponent: DialogDataComponent;
    let fixture: ComponentFixture<CharacterSelectionPageComponent>;
    let dialogDataFixture: ComponentFixture<DialogDataComponent>;

    const mockElementRef = {
        nativeElement: {
            scrollLeft: 0,
            scrollRight: 0,
        },
    } as ElementRef;

    const mockActivatedRoute = {
        snapshot: {
            params: {
                id: '123',
            },
        },
    };

    const mockGame = {
        id: '123',
        gameName: 'Game 1',
        gameDescription: 'Description 1',
        gameType: 'Type 1',
        mapSize: '10x10',
        map: [],
        isVisible: true,
        creationDate: new Date().toISOString(),
    };

    const mockData = {
        foundErrors: [],
        navigateGameSelection: false,
    };

    const mockHttpClientService = {
        getGame: jasmine.createSpy('getGame').and.returnValue(Promise.resolve(mockGame)),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CharacterSelectionPageComponent, HttpClientModule],
            providers: [
                { provide: HttpClientService, useValue: mockHttpClientService },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: MAT_DIALOG_DATA, useValue: mockData },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CharacterSelectionPageComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();

        dialogDataFixture = TestBed.createComponent(DialogDataComponent);
        dialogDataComponent = dialogDataFixture.componentInstance;

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

    it('should check if the game is valid to create', async () => {
        const isValid = await component.isGameValidToCreate();
        expect(isValid).toBe(true);
    });

    it('should check if the name is valid', () => {
        component.characterName = 'Name';
        const isValid = component.isNameValid();
        expect(isValid).toBe(true);
    });

    it('should check if the name is invalid (too short)', () => {
        component.characterName = 'Na';
        const isValid = component.isNameValid();
        expect(isValid).toBe(false);
    });

    it('should check if the name is invalid (too long)', () => {
        component.characterName = 'NameNameNameName';
        const isValid = component.isNameValid();
        expect(isValid).toBe(false);
    });

    it('should check if avatar in form is invalid', async () => {
        component.selectedAvatar = null;
        component.isNameValid = () => true;
        const errors = await component.formChecking();
        expect(errors.length).toBe(1);
    });

    it('should check if avatar in form is valid', async () => {
        component.selectedAvatar = { name: 'Avatar 1', img: '../../../assets/characters/1.png' };
        component.isNameValid = jasmine.createSpy('isValidName').and.returnValue(true);
        const errors = await component.formChecking();
        expect(errors.length).toBe(0);
    });

    it('should check if form is invalid (name and avatar)', async () => {
        component.selectedAvatar = null;
        component.isNameValid = jasmine.createSpy('isValidName').and.returnValue(false);
        const errors = await component.formChecking();
        expect(errors.length).toBe(2);
    });

    it('onSubmit should call formChecking', async () => {
        const event = {
            preventDefault: jasmine.createSpy('preventDefault'),
        } as unknown as Event;
        component.formChecking = jasmine.createSpy('formChecking').and.returnValue([]);
        await component.onSubmit(event);
        expect(component.formChecking).toHaveBeenCalled();
    });

    it('onSubmit should navigate to game page', async () => {
        const event = {
            preventDefault: jasmine.createSpy('preventDefault'),
        } as unknown as Event;
        component.formChecking = jasmine.createSpy('formChecking').and.returnValue([]);
        const navigate = spyOn((component as any).router, 'navigate');
        await component.onSubmit(event);
        expect(navigate).toHaveBeenCalled();
    });

    it('onSubmit should open a dialog if form is invalid (game not found)', async () => {
        const event = {
            preventDefault: jasmine.createSpy('preventDefault'),
        } as unknown as Event;
        component.formChecking = jasmine.createSpy('formChecking').and.returnValue([]);
        component.isGameValidToCreate = jasmine.createSpy('isGameValidToCreate').and.returnValue(false);
        const open = spyOn((component as any).dialog, 'open');
        await component.onSubmit(event);
        expect(open).toHaveBeenCalled();
    });

    it('onSubmit should open a dialog if form is invalid (errors in form found)', async () => {
        const event = {
            preventDefault: jasmine.createSpy('preventDefault'),
        } as unknown as Event;
        component.formChecking = jasmine.createSpy('formChecking').and.returnValue(['error']);
        const open = spyOn((component as any).dialog, 'open');
        await component.onSubmit(event);
        expect(open).toHaveBeenCalled();
    });

    it('should inject MAT_DIALOG_DATA', () => {
        expect(dialogDataComponent.data).toEqual({ foundErrors: [], navigateGameSelection: false });
    });
});
