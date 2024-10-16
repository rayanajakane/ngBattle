import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';
import { DragDropService } from './drag-drop.service';
import { EditGameService } from './edit-game.service';
import { HttpClientService } from './httpclient.service';
import { IDGenerationService } from './idgeneration.service';
import { MapEditService } from './map-edit.service';

describe('EditGameService', () => {
    let service: EditGameService;

    const mockIdGenerationService = {
        generateID: jasmine.createSpy('generateID').and.returnValue('456'),
    };
    const mockHttpClientService = jasmine.createSpyObj('HttpClientService', ['getGame', 'gameExists', 'sendGame', 'updateGame']);
    const mockMatDialog = {
        open: jasmine.createSpy('open'),
    };

    const dragDropServiceSpy = jasmine.createSpyObj('DragDropService', ['setMultipleItemCounter']);

    const mapEditServiceSpy = jasmine.createSpyObj('MapEditService', ['setGame', 'configureGame']);

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
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
