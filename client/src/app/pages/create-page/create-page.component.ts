import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GameMode } from '@app/data-structure/enum/game-mode-enum';
import { SizeMap } from '@app/data-structure/enum/size-map-enum';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-create-page',
    standalone: true,
    imports: [FormsModule, RouterLink, CommonModule, MatRadioModule, MatIconModule],
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
        this.router.navigate(['/edit']);
    }
}
