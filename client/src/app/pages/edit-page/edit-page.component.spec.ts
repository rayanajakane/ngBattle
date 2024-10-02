import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { CurrentMode } from '@app/data-structure/editViewSelectedMode';
import { GameJson } from '@app/data-structure/game-structure';
import { HttpClientService } from '@app/services/httpclient.service';
import { IDGenerationService } from '@app/services/idgeneration.service';
import { MapService } from '@app/services/map.service';
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

    // const mockRouter = {
    //     navigate: jasmine.createSpy('navigate'),
    // };

    const mockHttpClientService = {
        getGame: jasmine.createSpy('getGame'),
        gameExists: jasmine.createSpy('gameExists'),
        sendGame: jasmine.createSpy('sendGame'),
        updateGame: jasmine.createSpy('updateGame'),
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
                // { provide: Router, useValue: mockRouter },
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
        mockHttpClientService.gameExists.and.returnValue(Promise.resolve());
        mockHttpClientService.sendGame.and.returnValue({
            subscribe: ({ next }: { next: Function }) => {
                next();
            },
        });
        mockHttpClientService.updateGame.and.returnValue({
            subscribe: ({ next }: { next: Function }) => {
                next();
            },
        });

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

    it('saveGame should call updateGame if game exists', async () => {
        component.game = mockGameJson;
        mockHttpClientService.gameExists.and.returnValue(Promise.resolve(true));
        await component.saveGame();
        expect(mockHttpClientService.gameExists).toHaveBeenCalled();
        expect(mockHttpClientService.updateGame).toHaveBeenCalled();
    });

    it('saveGame should call sendGame if game does not exists', async () => {
        mockHttpClientService.gameExists.and.returnValue(Promise.resolve(false));
        await component.saveGame();
        console.log(component.game);
        expect(mockHttpClientService.sendGame).toHaveBeenCalled();
    });
});
