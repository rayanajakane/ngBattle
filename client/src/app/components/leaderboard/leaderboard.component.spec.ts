import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerCoord } from '@app/pages/game-page/game-page.component';
import { Player } from '@common/player';
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
            attributes: { health: '100', speed: '10', attack: '20', defense: '30', dice: '6' },
            isActive: true,
            abandoned: false,
            wins: 5,
            isVirtual: false,
        };

        const player2: Player = {
            id: '2',
            name: 'Player 2',
            isAdmin: false,
            avatar: 'avatar2.png',
            attributes: { health: '90', speed: '9', attack: '18', defense: '28', dice: '6' },
            isActive: true,
            abandoned: false,
            wins: 3,
            isVirtual: false,
        };

        const playerCoord1: PlayerCoord = { player: player1, position: 1 };
        const playerCoord2: PlayerCoord = { player: player2, position: 2 };

        component.playerCoords = [playerCoord1, playerCoord2];
        component.activePlayer = player1;
        component.ngOnChanges();

        expect(component.dataSource).toEqual([player1, player2]);
    });
});
