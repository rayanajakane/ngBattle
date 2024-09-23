import { Component, ViewChild, ElementRef } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
    selector: 'app-character-selection-page',
    standalone: true,
    imports: [NgFor],
    templateUrl: './character-selection-page.component.html',
    styleUrl: './character-selection-page.component.scss',
})
export class CharacterSelectionPageComponent {
    // Champs publics
    @ViewChild('widgetsContent', { static: false }) widgetsContent: ElementRef;

    avatars = [
        { name: 'Avatar 1', img: '../../../assets/avatars/avatar1.png' },
        { name: 'Avatar 2', img: '../../../assets/avatars/avatar2.png' },
        // Ajoute les autres avatars ici
    ];

    life: number;
    speed: number;
    attack: number;
    defense: number;
    selectedDice: { attack: number; defense: number };
    selectedAvatar: { name: string; img: string } | null = null;

    // Constantes privées (camelCase)
    private readonly defaultAttributeValue = 4;
    private readonly defaultAttributeValueSelected = 6;
    private readonly dice4 = 4;
    private readonly dice6 = 6;

    // Initialisation dans le constructeur
    constructor() {
        this.life = this.defaultAttributeValueSelected;
        this.speed = this.defaultAttributeValue;
        this.attack = this.defaultAttributeValue;
        this.defense = this.defaultAttributeValue;
        this.selectedDice = { attack: this.dice4, defense: this.dice6 }; // Par défaut
    }

    // Méthodes publiques
    selectAvatar(avatar: { name: string; img: string }): void {
        this.selectedAvatar = avatar;
    }

    scrollLeft(): void {
        this.widgetsContent.nativeElement.scrollLeft -= 150;
    }

    scrollRight(): void {
        this.widgetsContent.nativeElement.scrollLeft += 150;
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
        const selectedValue = parseInt(target.value, 10);

        this.selectedDice.attack = selectedValue;
        this.selectedDice.defense = selectedValue === this.dice4 ? this.dice6 : this.dice4;
    }
}
