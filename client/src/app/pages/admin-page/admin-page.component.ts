import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AdminItemComponent } from '@app/components/admin-components/admin-item/admin-item.component';
// import { GameMode as gMode } from '@app/data-structure/enum/game-mode-enum';
// import { SizeMap as Size } from '@app/data-structure/enum/size-map-enum';
// import { Game } from '@app/data-structure/game-structure/game-structure';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';

import { GameJson, HttpclientService } from '@app/services/httpclient.service';

@Component({
    selector: 'app-admin-page',
    standalone: true,
    imports: [AdminItemComponent, RouterLink, RouterOutlet, MatButtonModule, MatGridListModule, MatCardModule],
    templateUrl: './admin-page.component.html',
    styleUrl: './admin-page.component.scss',
})
export class AdminPageComponent {
    constructor(private http: HttpclientService) {}

    games: GameJson[];

    ngOnInit() {
        this.loadGames();
    }

    loadGames() {
        this.http.getAllGames().subscribe((data: GameJson[]) => {
            this.games = data;
        });
        console.log(this.games);
    }
}
