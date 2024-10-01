import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AdminItemComponent } from '@app/components/admin-components/admin-item/admin-item.component';
import { GameJson } from '@app/data-structure/game-structure';
import { HttpClientService } from '@app/services/httpclient.service';

@Component({
    selector: 'app-admin-page',
    standalone: true,
    imports: [AdminItemComponent, RouterLink, RouterOutlet, MatButtonModule, MatGridListModule, MatCardModule],
    templateUrl: './admin-page.component.html',
    styleUrl: './admin-page.component.scss',
})
export class AdminPageComponent implements OnInit {
    games: GameJson[];

    constructor(private http: HttpClientService) {}

    async ngOnInit() {
        this.games = await this.http.getAllGames();
    }
}
