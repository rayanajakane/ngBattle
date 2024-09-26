import { NgFor } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';

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

    avatars: { name: string; img: string }[];

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
    private readonly nAvatars: number = 12;

    // Initialisation dans le constructeur
    constructor() {
        this.life = this.defaultAttributeValueSelected;
        this.speed = this.defaultAttributeValue;
        this.attack = this.defaultAttributeValue;
        this.defense = this.defaultAttributeValue;
        this.selectedDice = { attack: this.dice6, defense: this.dice4 }; // Par défaut
        // this.setAvatars();

        // Initialisation des avatars
        this.avatars = [];
        for (let i = 1; i <= this.nAvatars; i++) {
            this.avatars.push({
                name: `Avatar ${i}`,
                img: `../../../assets/characters/${i}.png`, // Chemin générique pour les images
            });
        }
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
        const selectedValue = target.value;

        if (selectedValue === 'attack') {
            this.selectedDice.attack = this.dice6;
            this.selectedDice.defense = this.dice4;
        } else if (selectedValue === 'defense') {
            this.selectedDice.attack = this.dice4;
            this.selectedDice.defense = this.dice6;
        }
    }
    // TODO: discuter Supprimer cette méthode
    // setAvatars(): void {
    //     this.avatars = [];
    //     for (let i = 1; i <= this.nAvatars; i++) {
    //         this.avatars.push({
    //             name: `Avatar ${i}`,
    //             img: `../../../assets/characters/${i}.png`, // Chemin générique pour les images
    //         });
    //     }
    // }
}
