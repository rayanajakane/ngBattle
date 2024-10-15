import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { TileJson } from '@app/data-structure/game-structure';
import { MapComponent } from '../../components/map/map.component';

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
        MapComponent,
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
