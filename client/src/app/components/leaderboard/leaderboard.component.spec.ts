import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Player, PlayerAttribute } from '@app/interfaces/player';
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
    it('should update dataSource on ngOnChanges', () => {
        component.playerCoords = [
            {
                player: { id: '1', name: 'Player1', isAdmin: false, avatar: '', attributes: {} as PlayerAttribute, isActive: true, abandoned: false },
                position: 10,
            },
            {
                player: { id: '2', name: 'Player2', isAdmin: false, avatar: '', attributes: {} as PlayerAttribute, isActive: true, abandoned: false },
                position: 20,
            },
        ];
        component.ngOnChanges();
        expect(component.dataSource).toEqual([
            { id: '1', name: 'Player1', isAdmin: false, avatar: '', attributes: {} as PlayerAttribute, isActive: true, abandoned: false },
            { id: '2', name: 'Player2', isAdmin: false, avatar: '', attributes: {} as PlayerAttribute, isActive: true, abandoned: false },
        ]);
    });

    it('should have correct displayedColumns', () => {
        expect(component.displayedColumns).toEqual(['role', 'playerName', 'nWins']);
    });

    it('should set activePlayer correctly', () => {
        const activePlayer = {
            id: '3',
            name: 'Player3',
            isAdmin: true,
            avatar: '',
            attributes: {} as PlayerAttribute,
            isActive: true,
            abandoned: false,
        } as Player;
        component.activePlayer = activePlayer;
        fixture.detectChanges();
        expect(component.activePlayer).toEqual(activePlayer);
    });

    it('should set turn correctly', () => {
        component.turn = 5;
        fixture.detectChanges();
        expect(component.turn).toBe(5);
    });
});
