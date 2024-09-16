import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameMode } from '@app/data-structure/enum/game-mode-enum';
import { SizeMap } from '@app/data-structure/enum/size-map-enum';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

@Component({
    selector: 'app-create-page',
    standalone: true,
    imports: [FormsModule, RouterLink, CommonModule],
    templateUrl: './create-page.component.html',
    styleUrl: './create-page.component.scss',
})
export class CreatePageComponent {
    gameMode: GameMode = GameMode.Classic;
    sizeMap: SizeMap = SizeMap.Small;
    nameGame: string = '';
    descriptionGame: string = '';

    constructor(private router: Router) {}

    submitChoice() {
        console.log('Game Name:', this.nameGame);
        console.log('Description:', this.descriptionGame);
        console.log('Game Mode:', this.gameMode);
        console.log('Map Size:', this.sizeMap);
        // Navigate to another page if needed
        this.router.navigate(['/edit']);
    }
}
