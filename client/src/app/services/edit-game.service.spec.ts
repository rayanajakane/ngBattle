import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';
import { GameJson } from '@app/data-structure/game-structure';
import { DragDropService } from './drag-drop.service';
import { EditGameService } from './edit-game.service';
import { HttpClientService } from './httpclient.service';
import { IDGenerationService } from './idgeneration.service';
import { MapEditService } from './map-edit.service';

describe('EditGameService', () => {
    let service: EditGameService;
    let mockGameJson: GameJson;

    const mockIdGenerationService = {
        generateID: jasmine.createSpy('generateID').and.returnValue('456'),
    };
    const mockHttpClientService = jasmine.createSpyObj('HttpClientService', ['getGame', 'gameExists', 'sendGame', 'updateGame']);
    const mockMatDialog = {
        open: jasmine.createSpy('open'),
    };

    const dragDropServiceSpy = jasmine.createSpyObj('DragDropService', ['setMultipleItemCounter']);
    const mapEditServiceSpy = jasmine.createSpyObj('MapEditService', ['setTiles']);

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter([]),
                { provide: IDGenerationService, useValue: mockIdGenerationService },
                { provide: MapEditService, useValue: mapEditServiceSpy },
                { provide: DragDropService, useValue: dragDropServiceSpy },
                { provide: HttpClientService, useValue: mockHttpClientService },
                { provide: MatDialog, useValue: mockMatDialog },
            ],
        });
        service = TestBed.inject(EditGameService);

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
            subscribe: ({ next }: { next: () => void }) => {
                next();
            },
        });
        mockHttpClientService.updateGame.and.returnValue({
            subscribe: ({ next }: { next: () => void }) => {
                next();
            },
        });
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // it('should call setGame with correct argument on initializeEditPage', async () => {
    //     spyOn(service, 'configureGame');

    //     spyOn(service, 'getQueryParam').and.returnValue('123');

    //     await service.initializeEditPage();

    //     expect(mapEditServiceSpy.setGame).toHaveBeenCalledWith('123');
    //     expect(service.configureGame).toHaveBeenCalled();

    //     expect(dragDropServiceSpy.setMultipleItemCounter).toHaveBeenCalledWith(parseInt(mockGameJson.mapSize, 10), mockGameJson.map);
    // });
});
