import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-player-panel',
    standalone: true,
    imports: [MatCardModule],
    templateUrl: './player-panel.component.html',
    styleUrl: './player-panel.component.scss',
})
export class PlayerPanelComponent {
    @Input() playerName: string;
    @Input() lifePoints: number;
    @Input() speed: number;
    @Input() attack: number;
    @Input() bonusAttackDice: string;
    @Input() defense: number;
    @Input() bonusDefenseDice: string;
    @Input() movementPoints: number;
    @Input() actions: number;
    @Input() selectedAvatar: string;
}
