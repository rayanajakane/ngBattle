import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-player-panel',
    standalone: true,
    imports: [MatCardModule],
    templateUrl: './player-panel.component.html',
    styleUrl: './player-panel.component.scss',
})
export class PlayerPanelComponent {
    playerName: string;
    lifePoints: number;
    speed: number;
    attack: number;
    bonusAttackDice: string;
    defense: number;
    bonusDefenseDice: string;
    movementPoints: number;
    actions: number;
}
