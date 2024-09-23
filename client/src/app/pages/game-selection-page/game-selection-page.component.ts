import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { GameSelectionComponent } from '@app/components/game-selection/game-selection.component';
import { GameJson } from '@app/data-structure/game-structure';
import { HttpClientService } from '@app/services/httpclient.service';
import { firstValueFrom } from 'rxjs';
import { NgFor } from '@angular/common';

@Component({
    selector: 'app-game-selection-page',
    standalone: true,
    imports: [GameSelectionComponent, NgFor],
    templateUrl: './game-selection-page.component.html',
    styleUrls: ['./game-selection-page.component.scss'],
})
export class GameSelectionPageComponent implements OnInit {
    @ViewChild('widgetsContent', { static: false }) widgetsContent: ElementRef;

    games: GameJson[];

    constructor(private http: HttpClientService) {}

    async ngOnInit() {
        this.games = (await firstValueFrom(this.http.getAllGames())).filter((game) => {
            return game.isVisible === true;
        });
    }

    scrollLeft() {
        this.widgetsContent.nativeElement.scrollLeft -= 300;
    }

    scrollRight() {
        this.widgetsContent.nativeElement.scrollLeft += 300;
    }
}
