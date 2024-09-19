import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { Router, RouterLink } from '@angular/router';

@Component({
    selector: 'app-create-page',
    standalone: true,
    imports: [FormsModule, RouterLink, CommonModule, MatRadioModule, MatIconModule],
    templateUrl: './create-page.component.html',
    styleUrl: './create-page.component.scss',
})
export class CreatePageComponent {
    gameType: string;
    gameName: string;
    gameDescription: string;
    mapSize: string;
    constructor(private router: Router) {}
    submitChoice() {
        this.router.navigate(['/edit']);
    }
}
