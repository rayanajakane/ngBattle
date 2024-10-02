import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { EditHeaderDialogComponent } from '@app/components/edit-header-dialog/edit-header-dialog.component';
import { CurrentMode } from '@app/data-structure/editViewSelectedMode';
import { GameJson } from '@app/data-structure/game-structure';
import { HttpClientService } from '@app/services/httpclient.service';
import { IDGenerationService } from '@app/services/idgeneration.service';
import { MapService } from '@app/services/map.service';
import { of } from 'rxjs';
import { EditPageComponent } from './edit-page.component';

describe('EditPageComponent', () => {
    let component: EditPageComponent;
    let fixture: ComponentFixture<EditPageComponent>;
    let mockGameJson: GameJson;
    const mockCreateGameReturn = {
        id: '456',
        gameName: 'Sans titre',
        gameDescription: 'Il était une fois...',
        mapSize: '10',
        map: [],
        gameType: '',
        isVisible: true,
        creationDate: '',
        lastModified: '',
    } as GameJson;

    const mockHttpClientService = {
        getGame: jasmine.createSpy('getGame'),
    };

    const mapServiceSpy = {
        createGrid: jasmine.createSpy('createGrid'),
    };

    const mockMatDialog = {
        open: jasmine.createSpy('open'),
    };

    const mockIdGenerationService = {
        generateID: jasmine.createSpy('generateID').and.returnValue('456'),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EditPageComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter([]),
                { provide: IDGenerationService, useValue: mockIdGenerationService },
                { provide: MapService, useValue: mapServiceSpy },
                { provide: HttpClientService, useValue: mockHttpClientService },
                { provide: MatDialog, useValue: mockMatDialog },
            ],
        }).compileComponents();

        mockGameJson = {
            id: '123',
            gameName: 'Test Game',
            gameDescription: 'Test Description',
            mapSize: '10',
            map: [
                {
                    idx: 1,
                    tileType: 'water',
                    hasPlayer: false,
                    item: '',
                },
                {
                    idx: 2,
                    tileType: 'grass',
                    hasPlayer: false,
                    item: '',
                },
                {
                    idx: 3,
                    tileType: 'water',
                    hasPlayer: false,
                    item: '',
                },
            ],
            gameType: '',
            isVisible: true,
            creationDate: '',
            lastModified: '',
        };

        mockHttpClientService.getGame.and.returnValue(mockGameJson);
        fixture = TestBed.createComponent(EditPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('setGame should call getGame', () => {
        component.setGame('123');
        expect(mockHttpClientService.getGame).toHaveBeenCalledWith('123');
    });

    it('setGame should set a default game if no game is found', async () => {
        const createGameSpy = spyOn(component, 'createGameJSON');
        mockHttpClientService.getGame.and.returnValue(null);
        await component.setGame('');
        expect(createGameSpy).toHaveBeenCalled();
    });

    it('configureGame should set gameType and mapSize and call createGrid if map is empty', () => {
        const selectGameTypeSpy = spyOn(component, 'selectGameType');
        const selectMapSizeSpy = spyOn(component, 'selectMapSize');
        component.game = mockGameJson;
        component.game.map = [];
        component.configureGame();
        expect(selectGameTypeSpy).toHaveBeenCalled();
        expect(selectMapSizeSpy).toHaveBeenCalled();
        expect(mapServiceSpy.createGrid).toHaveBeenCalled();
    });

    it('configureGame should set gameCreated to true', () => {
        component.game = mockGameJson;
        component.gameCreated = false;
        component.configureGame();
        expect(component.gameCreated).toBeTrue();
    });

    it('configureGame should set mapSize', () => {
        component.game = mockGameJson;
        component.configureGame();
        expect(component.mapSize).toBe(10);
    });

    it('selectGameType should return ctf', () => {
        const gameType = component.selectGameType('test');
        expect(gameType).toBe('ctf');
    });

    it('selectGameType should return classic', () => {
        const gameType = component.selectGameType('classic');
        expect(gameType).toBe('classic');
    });

    it('selectMapSize should return 15', () => {
        const mapSize = component.selectMapSize('medium');
        expect(mapSize).toBe('15');
    });

    it('selectMapSize should return 20', () => {
        const mapSize = component.selectMapSize('large');
        expect(mapSize).toBe('20');
    });

    it('selectMapSize should return 10', () => {
        const mapSize = component.selectMapSize('test');
        expect(mapSize).toBe('10');
    });

    it('resetGame should set gameCreated to false', () => {
        component.gameCreated = true;
        component.resetGame();
        expect(component.gameCreated).toBeFalse();
    });

    it('resetGame should call setGame and configureGame', async () => {
        const setGameSpy = spyOn(component, 'setGame').and.returnValue(Promise.resolve());
        const configureGameSpy = spyOn(component, 'configureGame');

        component.game.id = '123';
        await component.resetGame();
        expect(setGameSpy).toHaveBeenCalledWith('123');
        expect(configureGameSpy).toHaveBeenCalled();
    });

    // it('openDialog should call dialog.open', () => {
    //     const dialogSpy = spyOn(component.dialog, 'open');
    //     component.openDialog();
    //     expect(dialogSpy).toHaveBeenCalled();
    // });

    it('changeSelectedTile should set selectedTileType and selectedMode', () => {
        component.selectedItem = 'test';
        component.selectedTileType = '';
        component.changeSelectedTile('test');
        expect(component.selectedItem).toBe('');
        expect(component.selectedTileType).toBe('test');
        expect(component.selectedMode).toBe(CurrentMode.TileTool);
    });

    it('changeSelectedItem should set selectedItem and selectedMode', () => {
        component.selectedItem = '';
        component.selectedTileType = 'test';
        component.changeSelectedItem('test');
        expect(component.selectedItem).toBe('test');
        expect(component.selectedTileType).toBe('');
        expect(component.selectedMode).toBe(CurrentMode.ItemTool);
    });

    it('createGameJSON should return a GameJson object', () => {
        const game = component.createGameJSON();
        expect(game).toEqual(mockCreateGameReturn);
    });

    it('openDialog should call dialog.open with correct data', () => {
        const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(null) });
        mockMatDialog.open.and.returnValue(dialogRefSpyObj);

        component.game = mockGameJson;
        component.openDialog();

        expect(mockMatDialog.open).toHaveBeenCalledWith(EditHeaderDialogComponent, {
            data: { gameNameInput: component.game.gameName, gameDescriptionInput: component.game.gameDescription },
        });
    });

    it('openDialog should update gameName and gameDescription when dialog is closed with result', () => {
        const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({ gameNameInput: 'New Name', gameDescriptionInput: 'New Description' }) });
        mockMatDialog.open.and.returnValue(dialogRefSpyObj);

        component.game = mockGameJson;
        component.openDialog();

        expect(component.game.gameName).toBe('New Name');
        expect(component.game.gameDescription).toBe('New Description');
    });

    it('openDialog should not update gameName and gameDescription when dialog is closed without result', () => {
        const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(null) });
        mockMatDialog.open.and.returnValue(dialogRefSpyObj);

        component.game = mockGameJson;
        component.openDialog();

        expect(component.game.gameName).toBe(mockGameJson.gameName);
        expect(component.game.gameDescription).toBe(mockGameJson.gameDescription);
    });
});
