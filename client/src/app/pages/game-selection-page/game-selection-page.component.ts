import { NgFor } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { GameSelectionComponent } from '@app/components/game-selection/game-selection.component';
import { GameJson } from '@app/data-structure/game-structure';
import { HttpClientService } from '@app/services/httpclient.service';

@Component({
    selector: 'app-game-selection-page',
    standalone: true,
    imports: [GameSelectionComponent, NgFor],
    templateUrl: './game-selection-page.component.html',
    styleUrls: ['./game-selection-page.component.scss'],
})
export class GameSelectionPageComponent {
    @ViewChild('widgetsContent', { static: false }) widgetsContent: ElementRef;

    games: GameJson[];

    private readonly scrollValue: number = 300;

    constructor(private http: HttpClientService) {
        this.http.getAllGames().then((games) => {
            this.games = games.filter((game) => game.isVisible);
        });
    }

    scrollLeft() {
        this.widgetsContent.nativeElement.scrollLeft -= this.scrollValue;
    }

    scrollRight() {
        this.widgetsContent.nativeElement.scrollRight += this.scrollValue;
    }
}
