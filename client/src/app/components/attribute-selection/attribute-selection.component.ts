import { Component } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-attribute-selection',
    standalone: true,
    imports: [MatTooltipModule],
    templateUrl: './attribute-selection.component.html',
    styleUrl: './attribute-selection.component.scss',
})
export class AttributeSelectionComponent {
    life: number;
    speed: number;
    attack: number;
    defense: number;

    readonly healthDescription: string;
    readonly speedDescription: string;
    readonly attackDescription: string;
    readonly defenseDescription: string;

    selectedDice: { attack: number; defense: number };

    private readonly defaultAttributeValue: number = 4;
    private readonly defaultAttributeValueSelected: number = 6;
    private readonly dice4: number = 4;
    private readonly dice6: number = 6;

    constructor() {
        this.life = this.defaultAttributeValueSelected;
        this.speed = this.defaultAttributeValue;
        this.attack = this.defaultAttributeValue;
        this.defense = this.defaultAttributeValue;
        this.selectedDice = { attack: this.dice6, defense: this.dice4 };

        this.healthDescription = 'Le nombre de points de vie du personage';
        this.speedDescription = "Sert a déterminer l'ordre des tours et correspond aussi au points de mouvement par tours du personnage";
        this.attackDescription = 'Représente la force avec laquelle une attaque est faite par le personnage';
        this.defenseDescription = 'Représente la capacité du personnage à se défendre contre une attaque';
    }

    addBonus(attribute: 'life' | 'speed'): void {
        if (attribute === 'life') {
            this.life += 2;
            this.speed -= 2;
        } else if (attribute === 'speed') {
            this.speed += 2;
            this.life -= 2;
        }
    }

    assignDice(event: Event): void {
        const target = event.target as HTMLSelectElement;
        const selectedValue = target.value;
        if (selectedValue === 'attack') {
            this.selectedDice.attack = this.dice6;
            this.selectedDice.defense = this.dice4;
        } else if (selectedValue === 'defense') {
            this.selectedDice.attack = this.dice4;
            this.selectedDice.defense = this.dice6;
        }
    }
}
