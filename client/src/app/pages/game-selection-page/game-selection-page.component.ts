import { Component } from '@angular/core';
import { GameSelectionComponent } from '@app/components/game-selection/game-selection.component';
import { GameJson } from '@app/data-structure/game-structure';
import { HttpClientService } from '@app/services/httpclient.service';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-game-selection-page',
    standalone: true,
    imports: [GameSelectionComponent],
    templateUrl: './game-selection-page.component.html',
    styleUrl: './game-selection-page.component.scss',
})
export class GameSelectionPageComponent {
    games: GameJson[];

    constructor(private http: HttpClientService) {}

    async ngOnInit() {
        this.games = await firstValueFrom(this.http.getAllGames());
    }
}
