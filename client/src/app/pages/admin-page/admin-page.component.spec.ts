import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { AdminItemComponent } from '@app/components/admin-components/admin-item/admin-item.component';
import { GameJson } from '@app/data-structure/game-structure';
import { HttpClientService } from '@app/services/httpclient.service';
import { of } from 'rxjs';
import { AdminPageComponent } from './admin-page.component';

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;
    let httpClientService: jasmine.SpyObj<HttpClientService>;

    const mockGames: GameJson[] = [
        {
            id: '1',
            gameName: 'Game 1',
            gameDescription: 'This is an example game description.',
            mapSize: '2',
            map: [
                { idx: 0, tileType: '', item: 'startingPoint', hasPlayer: false },
                { idx: 1, tileType: 'water', item: 'startingPoint', hasPlayer: false },
                { idx: 2, tileType: '', item: '', hasPlayer: true },
                { idx: 3, tileType: '', item: '', hasPlayer: false },
            ],
            gameType: 'ctf',
            isVisible: true,
            creationDate: '2024-09-18T10:30:00.000Z',
            lastModified: '2024-09-18T10:30:00.000Z',
        },
        {
            id: '2',
            gameName: 'Game 2',
            gameDescription: 'This is an example game description.',
            mapSize: '2',
            map: [
                { idx: 0, tileType: '', item: 'startingPoint', hasPlayer: false },
                { idx: 1, tileType: 'water', item: '', hasPlayer: false },
                { idx: 2, tileType: 'ice', item: '', hasPlayer: true },
                { idx: 3, tileType: '', item: 'startingPoint', hasPlayer: false },
            ],
            gameType: 'ctf',
            isVisible: true,
            creationDate: '2024-09-18T10:30:00.000Z',
            lastModified: '2024-09-18T10:30:00.000Z',
        },
        {
            id: '3',
            gameName: 'Game 3',
            gameDescription: 'This is an example game description.',
            mapSize: '2',
            map: [
                { idx: 0, tileType: '', item: 'startingPoint', hasPlayer: false },
                { idx: 1, tileType: 'water', item: '', hasPlayer: false },
                { idx: 2, tileType: 'ice', item: 'startingPoint', hasPlayer: true },
                { idx: 3, tileType: '', item: '', hasPlayer: false },
            ],
            gameType: 'ctf',
            isVisible: true,
            creationDate: '2024-09-18T10:30:00.000Z',
            lastModified: '2024-09-18T10:30:00.000Z',
        },
    ];

    beforeEach(async () => {
        const httpClientServiceSpy = jasmine.createSpyObj('HttpClientService', ['getAllGames']);
        const activatedRouteStub = {
            snapshot: {
                paramMap: {
                    get: () => 'test-id',
                },
            },
        };

        await TestBed.configureTestingModule({
            imports: [AdminPageComponent, MatButtonModule, MatCardModule, MatGridListModule, RouterLink, RouterOutlet, AdminItemComponent],
            providers: [
                { provide: HttpClientService, useValue: httpClientServiceSpy },
                { provide: ActivatedRoute, useValue: activatedRouteStub },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AdminPageComponent);
        component = fixture.componentInstance;
        httpClientService = TestBed.inject(HttpClientService) as jasmine.SpyObj<HttpClientService>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load games on ngOnInit', () => {
        httpClientService.getAllGames.and.returnValue(of(mockGames));

        component.ngOnInit();

        expect(httpClientService.getAllGames).toHaveBeenCalled();
        expect(component.games).toEqual(mockGames);
    });

    it('should call getAllGames when loadGames is called', () => {
        httpClientService.getAllGames.and.returnValue(of(mockGames));

        component.loadGames();

        expect(httpClientService.getAllGames).toHaveBeenCalled();
    });

    it('should set games property with the data returned from getAllGames', () => {
        httpClientService.getAllGames.and.returnValue(of(mockGames));

        component.loadGames();

        expect(component.games).toEqual(mockGames);
    });
});
