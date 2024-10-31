import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '@app/services/socket.service';
import { of } from 'rxjs';
import { WaitingPageComponent } from './waiting-page.component';

describe('WaitingPageComponent', () => {
    let component: WaitingPageComponent;
    let fixture: ComponentFixture<WaitingPageComponent>;
    let mockSocketService: jasmine.SpyObj<SocketService>;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;
    let mockDialog: jasmine.SpyObj<MatDialog>;

    beforeEach(async () => {
        mockSocketService = jasmine.createSpyObj('SocketService', ['once', 'on', 'emit']);
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockActivatedRoute = jasmine.createSpyObj('ActivatedRoute', [], {
            params: of({ roomId: 'testRoom', playerId: 'testPlayer', characterName: 'testName', selectedAvatar: 'Avatar 1', isAdmin: 'true' }),
        });
        mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

        await TestBed.configureTestingModule({
            imports: [WaitingPageComponent],
            providers: [
                { provide: SocketService, useValue: mockSocketService },
                { provide: Router, useValue: mockRouter },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: MatDialog, useValue: mockDialog },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(WaitingPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should get players on init', () => {
        const players = [
            {
                id: '1',
                name: 'Player 1',
                avatar: 'Avatar 1',
                attributes: { health: '4', speed: '4', attack: '4', defense: '4', dice: 'attack' },
                isAdmin: false,
            },
        ];
        mockSocketService.once.and.callFake((event: string, action: (data: any) => void) => {
            if (event === 'getPlayers') {
                action(players);
            }
        });

        component.getPlayers();

        expect(mockSocketService.emit).toHaveBeenCalledWith('getPlayers', component.roomId);
        expect(component.players).toEqual(players);
    });

    it('should update players on receiving updatePlayers event', () => {
        const players = [
            {
                id: '1',
                name: 'Player 1',
                avatar: 'Avatar 1',
                attributes: { health: '4', speed: '4', attack: '4', defense: '4', dice: 'attack' },
                isAdmin: false,
            },
        ];
        mockSocketService.on.and.callFake((event: string, action: (data: any) => void) => {
            if (event === 'updatePlayers') {
                action(players);
            }
        });

        component.updatePlayers();

        expect(component.players).toEqual(players);
    });

    it('should change lock button text on roomLocked event', () => {
        const lockButton = document.createElement('button');
        lockButton.id = 'lock-btn';
        document.body.appendChild(lockButton);

        component.maxPlayers = 4;
        component.players = [{}, {}, {}, {}] as any;

        mockSocketService.on.and.callFake((event: string, action: (data: any) => void) => {
            if (event === 'roomLocked') {
                action({});
            }
        });

        component.ngOnInit();
        fixture.detectChanges(); // Ensure the component and DOM are fully initialized

        expect(document.getElementById('lock-btn')?.innerHTML).toBe('Déverrouiller');
        expect(document.getElementById('lock-btn')?.getAttribute('disabled')).toBe('true');
    });

    it('should navigate to home on gameStarted event', () => {
        mockSocketService.once.and.callFake((event: string, action: (data: any) => void) => {
            if (event === 'gameStarted') {
                action({});
            }
        });

        component.gameStartedListener();

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should open kicked dialog on kicked event', () => {
        mockSocketService.once.and.callFake((event: string, action: (data: any) => void) => {
            if (event === 'kicked') {
                action({});
            }
        });

        component.ngOnInit();

        expect(mockDialog.open).toHaveBeenCalled();
    });

    it('should navigate home on roomLeft event', () => {
        mockSocketService.once.and.callFake((event: string, action: (data: any) => void) => {
            if (event === 'roomLeft') {
                action({});
            }
        });

        component.ngOnInit();

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should set max players on maxPlayers event', () => {
        const maxPlayers = 4;
        mockSocketService.on.and.callFake((event: string, action: (data: any) => void) => {
            if (event === 'maxPlayers') {
                action(maxPlayers);
            }
        });

        component.ngOnInit();

        expect(component.maxPlayers).toBe(maxPlayers);
    });

    it('should lock room on lockRoom call', () => {
        mockSocketService.on.and.callFake((event: string, action: (data: any) => void) => {
            if (event === 'isRoomLocked') {
                action(false);
            }
        });

        component.lockRoom();

        expect(mockSocketService.emit).toHaveBeenCalledWith('isRoomLocked', component.roomId);
        expect(mockSocketService.emit).toHaveBeenCalledWith('lockRoom', component.roomId);
    });

    it('should unlock room on lockRoom call if already locked', () => {
        mockSocketService.on.and.callFake((event: string, action: (data: any) => void) => {
            if (event === 'isRoomLocked') {
                action(true);
            }
        });

        component.lockRoom();

        expect(mockSocketService.emit).toHaveBeenCalledWith('isRoomLocked', component.roomId);
        expect(mockSocketService.emit).toHaveBeenCalledWith('unlockRoom', component.roomId);
    });

    it('should delete player on deletePlayer call', () => {
        const kickedPlayerId = 'testPlayerId';

        component.deletePlayer(kickedPlayerId);

        expect(mockSocketService.emit).toHaveBeenCalledWith('kickPlayer', { roomId: component.roomId, playerId: kickedPlayerId });
    });

    it('should start game on startGame call', () => {
        component.startGame();

        expect(mockSocketService.emit).toHaveBeenCalledWith('startGame', { roomId: component.roomId });
    });

    it('should open dialog on startError event', () => {
        const error = 'Test error';
        mockSocketService.once.and.callFake((event: string, action: (data: any) => void) => {
            if (event === 'startError') {
                action(error);
            }
        });

        component.startGame();

        expect(mockDialog.open).toHaveBeenCalled();
    });
});
