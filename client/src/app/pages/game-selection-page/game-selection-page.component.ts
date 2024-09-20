import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { GameSelectionComponent } from '@app/components/game-selection/game-selection.component';
import { GameJson } from '@app/data-structure/game-structure';
import { HttpClientService } from '@app/services/httpclient.service';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-game-selection-page',
    standalone: true,
    imports: [GameSelectionComponent],
    templateUrl: './game-selection-page.component.html',
    styleUrls: ['./game-selection-page.component.scss'], // Fixed plural
})
export class GameSelectionPageComponent implements OnInit {
    @ViewChild('widgetsContent', { static: false }) widgetsContent: ElementRef; // Moved inside the class

    games: GameJson[];

    constructor(private http: HttpClientService) {}

    async ngOnInit() {
        this.games = await firstValueFrom(this.http.getAllGames());
    }

    scrollLeft() {
        this.widgetsContent.nativeElement.scrollLeft -= 300;
    }

    scrollRight() {
        this.widgetsContent.nativeElement.scrollLeft += 300;
    }
}
