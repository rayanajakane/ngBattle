import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { Router, RouterLink } from '@angular/router';
import { MapService } from '@app/services/map.service';

@Component({
    selector: 'app-create-page',
    standalone: true,
    imports: [MatButtonModule, FormsModule, RouterLink, CommonModule, MatRadioModule, MatIconModule],
    templateUrl: './create-page.component.html',
    styleUrl: './create-page.component.scss',
})
export class CreatePageComponent {
    gameType: string;
    mapSize: string;
    constructor(
        private router: Router,
        private mapService: MapService,
    ) {}
    submitChoice() {
        this.router.navigate(['/edit']);
        this.mapService.setGameType(this.gameType);
        this.mapService.setMapSize(Number(this.mapSize));
    }
}
