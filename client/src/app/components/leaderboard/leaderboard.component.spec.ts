import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Player, PlayerCoord, PlayerStats } from '@common/player';
import { LeaderboardComponent } from './leaderboard.component';

describe('LeaderboardComponent', () => {
    let component: LeaderboardComponent;
    let fixture: ComponentFixture<LeaderboardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LeaderboardComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(LeaderboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should update dataSource correctly on ngOnChanges', () => {
        const player1: Player = {
            id: '1',
            name: 'Player 1',
            isAdmin: false,
            avatar: 'avatar1.png',
            attributes: {
                health: 10,
                speed: '8',
                attack: 7,
                defense: 5,
                dice: '6',
            },
            isActive: true,
            abandoned: false,
            wins: 5,
            stats: {} as PlayerStats,
        };

        const player2: Player = {
            id: '2',
            name: 'Player 2',
            isAdmin: false,
            avatar: 'avatar2.png',
            attributes: {
                health: 10,
                speed: '8',
                attack: 7,
                defense: 5,
                dice: '6',
            },
            isActive: true,
            abandoned: false,
            wins: 3,
            stats: {} as PlayerStats,
        };

        const playerCoord1: PlayerCoord = { player: player1, position: 1 };
        const playerCoord2: PlayerCoord = { player: player2, position: 2 };

        component.playerCoords = [playerCoord1, playerCoord2];
        component.activePlayer = player1;
        component.ngOnChanges();

        expect(component.dataSource).toEqual([player1, player2]);
    });
});
