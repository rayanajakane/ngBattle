import { ChangeDetectorRef, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogMessage } from '@app/interfaces/message';
import { SocketService } from '@app/services/socket.service';
import { LogsComponent } from './logs.component';

describe('LogsComponent', () => {
    let component: LogsComponent;
    let fixture: ComponentFixture<LogsComponent>;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;
    let cdrSpy: jasmine.SpyObj<ChangeDetectorRef>;

    beforeEach(async () => {
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['on']);
        cdrSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

        await TestBed.configureTestingModule({
            imports: [LogsComponent],
            providers: [
                { provide: SocketService, useValue: socketServiceSpy },
                { provide: ChangeDetectorRef, useValue: cdrSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(LogsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should toggle logs to playerLogs and update button text', () => {
        component.logs = [{ date: '22:22:22', receiver: 'player1', sender: 'player2', message: 'Test log' }];
        component.playerLogs = [{ date: '22:22:22', receiver: 'player1', sender: 'player2', message: 'Player log' }];
        component.currentLogs = component.logs;

        component.toggleLogs();

        expect(component.currentLogs).toBe(component.playerLogs);
        expect(component.btnText).toBe('Afficher tous les messages');
    });

    it('should toggle logs to all logs and update button text', () => {
        component.logs = [{ date: '22:22:22', receiver: 'player1', sender: 'player2', message: 'Test log' }];
        component.playerLogs = [{ date: '22:22:22', receiver: 'player1', sender: 'player2', message: 'Player log' }];
        component.currentLogs = component.playerLogs;

        component.toggleLogs();

        expect(component.currentLogs).toBe(component.logs);
        expect(component.btnText).toBe('Filtrer messages');
    });

    it('should scroll to bottom of the logs container', () => {
        const logsContainerMock = {
            nativeElement: {
                scrollTop: 0,
                scrollHeight: 100,
            },
        };
        component.logsContainer = logsContainerMock as ElementRef;

        component.scrollToBottom();

        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(component.logsContainer.nativeElement.scrollTop).toBe(100);
    });

    it('should receive a new log and update logs array', () => {
        const log: LogMessage = { date: '22:22:22', receiver: 'player1', sender: 'player2', message: 'Test log' };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        socketServiceSpy.on.and.callFake((event: string, callback: (log: any) => void) => {
            if (event === 'newLog') {
                callback(log);
            }
        });

        component.player = {
            id: 'player1',
            name: 'Player 1',
            isAdmin: false,
            avatar: 'avatar.png',
            attributes: {
                health: '100',
                speed: '10',
                attack: '20',
                defense: '30',
                dice: '6',
            },
            isActive: true,
            abandoned: false,
            wins: 0,
        };

        component.logsContainer = {
            nativeElement: {
                scrollTop: 0,
                scrollHeight: 100,
            },
        } as ElementRef;

        // Simulate receiving a log
        socketServiceSpy.on.calls.mostRecent().args[1](log);

        expect(component.logs.length).toBe(1);
        expect(component.logs[0]).toEqual(log);
        expect(component.playerLogs.length).toBe(1);
        expect(component.playerLogs[0]).toEqual(log);
        expect(component.logsContainer.nativeElement.scrollTop).toBe(component.logsContainer.nativeElement.scrollHeight);
    });

    it('should receive a new player log and update logs array', () => {
        const log: LogMessage = { date: '22:22:22', receiver: 'player1', sender: 'player2', message: 'Test player log' };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        socketServiceSpy.on.and.callFake((event: string, callback: (log: any) => void) => {
            if (event === 'newPlayerLog') {
                callback(log);
            }
        });

        component.player = {
            id: 'player1',
            name: 'Player 1',
            isAdmin: false,
            avatar: 'avatar.png',
            attributes: {
                health: '100',
                speed: '10',
                attack: '20',
                defense: '30',
                dice: '6',
            },
            isActive: true,
            abandoned: false,
            wins: 0,
        };

        component.logsContainer = {
            nativeElement: {
                scrollTop: 0,
                scrollHeight: 100,
            },
        } as ElementRef;

        // Simulate receiving a player log
        socketServiceSpy.on.calls.mostRecent().args[1](log);

        expect(component.logs.length).toBe(1);
        expect(component.logs[0]).toEqual(log);
        expect(component.playerLogs.length).toBe(1);
        expect(component.playerLogs[0]).toEqual(log);
        expect(component.logsContainer.nativeElement.scrollTop).toBe(component.logsContainer.nativeElement.scrollHeight);
    });
});
