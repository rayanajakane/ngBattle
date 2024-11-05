import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Player } from '@app/interfaces/player';
import { PlayerCoord } from '@app/pages/game-page/game-page.component';
import { GamePanelComponent } from './game-panel.component';

describe('GamePanelComponent', () => {
    let component: GamePanelComponent;
    let fixture: ComponentFixture<GamePanelComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [GamePanelComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GamePanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should set nPlayers to 0 if playerCoords is empty', () => {
        component.playerCoords = [];
        component.ngOnChanges();
        expect(component.nPlayers).toBe(0);
    });

    it('should set nPlayers to 0 if all players have abandoned', () => {
        const playerCoords: PlayerCoord[] = [
            { player: { abandoned: true }, position: 0 } as PlayerCoord,
            { player: { abandoned: true }, position: 1 } as PlayerCoord,
        ];
        component.playerCoords = playerCoords;
        component.ngOnChanges();
        expect(component.nPlayers).toBe(0);
    });
    it('should update nPlayers correctly when playerCoords changes', () => {
        const initialPlayerCoords: PlayerCoord[] = [{ player: { abandoned: false } as Player, position: 0 }];
        component.playerCoords = initialPlayerCoords;
        component.ngOnChanges();
        expect(component.nPlayers).toBe(1);

        const updatedPlayerCoords: PlayerCoord[] = [
            { player: { abandoned: false } as Player, position: 1 } as PlayerCoord,
            { player: { abandoned: false } as Player, position: 0 } as PlayerCoord,
        ];
        component.playerCoords = updatedPlayerCoords;
        component.ngOnChanges();
        expect(component.nPlayers).toBe(2);
    });
});
