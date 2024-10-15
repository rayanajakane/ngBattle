import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MapPreviewComponent } from '@app/components/map-preview/map-preview.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { TileJson } from '@app/data-structure/game-structure';

@Component({
    selector: 'app-game-page',
    standalone: true,
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
    imports: [
        MatToolbarModule,
        MatListModule,
        MatDividerModule,
        SidebarComponent,
        PlayAreaComponent,
        MapPreviewComponent,
        MatButtonModule,
        MatTabsModule,
        MatGridListModule,
    ],
})
export class GamePageComponent {
    mapSize: number = 10;
    gameMap: TileJson[];
    ngOnInit() {
        this.gameMap = Array(this.mapSize * this.mapSize).fill({ tileType: '' });
    }
}
