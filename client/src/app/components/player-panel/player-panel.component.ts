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
    @Input() lifePoints: string;
    @Input() speed: string;
    @Input() attack: string;
    bonusAttackDice: string = 'D4';
    @Input() defense: string;
    bonusDefenseDice: string = 'D4';
    @Input() movementPoints: number;
    @Input() nActions: number;
    @Input() selectedAvatar: string;
    @Input() bonusDice: string;
    ngOnInit() {
        if (this.bonusDice === 'attack') this.bonusAttackDice = 'D6';
        else if (this.bonusDice === 'defense') this.bonusDefenseDice = 'D6';
    }
}
