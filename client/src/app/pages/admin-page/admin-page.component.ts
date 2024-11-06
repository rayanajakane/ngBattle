import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AdminItemComponent } from '@app/components/admin-components/admin-item/admin-item.component';
import { Game } from '@app/data-structure/game-structure';
import { HttpClientService } from '@app/services/httpclient.service';

@Component({
    selector: 'app-admin-page',
    standalone: true,
    imports: [AdminItemComponent, RouterLink, RouterOutlet, MatButtonModule, MatGridListModule, MatCardModule],
    templateUrl: './admin-page.component.html',
    styleUrl: './admin-page.component.scss',
})
export class AdminPageComponent implements OnInit {
    games: Game[];

    constructor(
        private http: HttpClientService,
        private router: Router,
    ) {}

    async ngOnInit() {
        this.games = await this.http.getAllGames();
    }

    loadGames() {
        this.http.getAllGames().then((data: Game[]) => {
            this.games = data;
        });
    }

    editGame(gameId: string) {
        this.router.navigate(['/edit'], { queryParams: { gameId } });
    }
}
