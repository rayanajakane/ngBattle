import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PlayerAttribute } from '@common/player';

@Component({
    selector: 'app-attribute-selection',
    standalone: true,
    imports: [MatTooltipModule],
    templateUrl: './attribute-selection.component.html',
    styleUrl: './attribute-selection.component.scss',
})
export class AttributeSelectionComponent implements OnInit {
    @Output() attributesEmitter = new EventEmitter<PlayerAttribute>();

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

    ngOnInit() {
        this.changeAttributes();
    }

    addBonus(attribute: 'life' | 'speed'): void {
        if (attribute === 'life' && this.life === this.defaultAttributeValue) {
            this.life += 2;
            this.speed -= 2;
        } else if (attribute === 'speed' && this.speed === this.defaultAttributeValue) {
            this.speed += 2;
            this.life -= 2;
        }
        this.changeAttributes();
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
        this.changeAttributes();
    }

    changeAttributes() {
        const attributes: PlayerAttribute = {
            health: this.life.toString(),
            speed: this.speed.toString(),
            attack: this.attack.toString(),
            defense: this.defense.toString(),
            dice: this.selectedDice.attack === this.defaultAttributeValueSelected ? 'attack' : 'defense',
        };
        this.attributesEmitter.emit(attributes);
    }
}
