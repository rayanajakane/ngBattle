import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
    selector: 'app-combat-interface',
    standalone: true,
    imports: [MatProgressBarModule, MatCardModule, MatChipsModule, MatIconModule, MatButtonModule],
    templateUrl: './combat-interface.component.html',
    styleUrls: ['./combat-interface.component.scss'],
})
export class CombatInterfaceComponent implements OnInit {
    diceResult: number = 0;
    escapeChance: number = 0;
    combatInfo: string = '';
    diceInfo: string = '';
    escapeChanceInfo: string = '';

    ngOnInit() {
        this.diceInfo = 'Résultats des dés : ' + this.diceResult;
        this.escapeChanceInfo = "Nombre d'évasion : " + this.escapeChance;
    }
}
