import { NgFor } from '@angular/common';
import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClientService } from '@app/services/httpclient.service';

@Component({
    selector: 'app-character-selection-page',
    standalone: true,
    imports: [NgFor, FormsModule, MatButtonModule, MatTooltipModule, RouterLink],
    templateUrl: './character-selection-page.component.html',
    styleUrl: './character-selection-page.component.scss',
})
export class CharacterSelectionPageComponent {
    // Champs publics
    @ViewChild('widgetsContent', { static: false }) widgetsContent: ElementRef;

    dialog = inject(MatDialog);

    avatars: { name: string; img: string }[];
    selectedAvatar: { name: string; img: string } | null = null;
    characterName: string = '';
    life: number;
    speed: number;
    attack: number;
    defense: number;
    selectedDice: { attack: number; defense: number };

    readonly healthDescription: string;
    readonly speedDescription: string;
    readonly attackDescription: string;
    readonly defenseDescription: string;

    // Constantes privées (camelCase)
    private readonly defaultAttributeValue: number = 4;
    private readonly defaultAttributeValueSelected: number = 6;
    private readonly dice4: number = 4;
    private readonly dice6: number = 6;
    private readonly nAvatars: number = 12;
    private readonly minNameLength: number = 3;
    private readonly maxNameLength: number = 15;

    private readonly scrollValue: number = 150;

    // Initialisation dans le constructeur
    constructor(
        private router: Router,
        private http: HttpClientService,
        private route: ActivatedRoute,
    ) {
        this.life = this.defaultAttributeValueSelected;
        this.speed = this.defaultAttributeValue;
        this.attack = this.defaultAttributeValue;
        this.defense = this.defaultAttributeValue;
        this.selectedDice = { attack: this.dice6, defense: this.dice4 };

        this.healthDescription = 'Le nombre de points de vie du personage';
        this.speedDescription = "Sert a déterminer l'ordre des tours et correspond aussi au points de mouvement par tours du personnage";
        this.attackDescription = 'Représente la force avec laquelle une attaque est faite par le personnage';
        this.defenseDescription = 'Représente la capacité du personnage à se défendre contre une attaque';

        // Initialisation des avatars
        this.avatars = [];
        for (let i = 1; i <= this.nAvatars; i++)
            this.avatars.push({
                name: `Avatar ${i}`,
                img: `../../../assets/characters/${i}.png`, // Chemin générique pour les images
            });
    }

    // Méthodes publiques
    selectAvatar(avatar: { name: string; img: string }): void {
        this.selectedAvatar = avatar;
    }

    scrollLeft(): void {
        this.widgetsContent.nativeElement.scrollLeft -= this.scrollValue;
    }

    scrollRight(): void {
        this.widgetsContent.nativeElement.scrollRight += this.scrollValue;
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

    async formChecking(): Promise<string[]> {
        const errors: string[] = [];
        // Vérification des erreurs
        if (!this.selectedAvatar) errors.push('- Veuillez sélectionner un avatar avant de continuer');
        if (!this.isNameValid()) errors.push('- Veuillez mettre un nom pour le personne entre 3 et 15 charactères');

        return errors;
    }

    async isGameValidToCreate(): Promise<boolean> {
        return (await this.http.getGame(this.route.snapshot.params.id)) !== null;
    }

    isNameValid(): boolean {
        return this.characterName.length >= this.minNameLength && this.characterName.length <= this.maxNameLength;
    }

    async onSubmit(event: Event) {
        event.preventDefault();

        const errors = await this.formChecking();

        if (!(await this.isGameValidToCreate())) {
            this.dialog.open(DialogDataComponent, {
                data: {
                    foundErrors: ["La partie n'existe pas -> VOUS ÊTES RAMMENÉ VERS LA PAGE DE SÉLECTION DE PARTIE"],
                    navigateGameSelection: true,
                },
            });
        } else if (errors.length > 0) {
            this.dialog.open(DialogDataComponent, {
                data: {
                    foundErrors: errors,
                    navigateGameSelection: false,
                },
            });
        } else {
            // TODO: Envoi des données
            this.router.navigate(['/waitingRoom']);
        }
    }
}

@Component({
    selector: 'app-dialog-data-example-dialog',
    template: `<mat-dialog-content>
        <h1 mat-dialog-title>Note</h1>
        @for (error of data.foundErrors; track $index) {
        <p>{{ error }}</p>
        }
        <mat-dialog-actions>
            @if (data.navigateGameSelection) {
            <button mat-button mat-dialog-close [routerLink]="['/gameSelection']">Close</button>
            } @else {
            <button mat-button mat-dialog-close>Close</button>
            }
        </mat-dialog-actions>
    </mat-dialog-content>`,
    standalone: true,
    imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, RouterLink],
})
export class DialogDataComponent {
    data = inject(MAT_DIALOG_DATA);
}
