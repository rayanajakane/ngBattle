import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MapComponent } from '@app/components/map/map.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { ToolbarComponent } from '@app/components/toolbar/toolbar.component';

@Component({
    selector: 'app-edit-page',
    standalone: true,
    imports: [
        MapComponent,
        ToolbarComponent,
        SidebarComponent,
        MatButtonModule,
        MatIcon,
        MatMenuModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
    ],
    templateUrl: './edit-page.component.html',
    styleUrl: './edit-page.component.scss',
})
export class EditPageComponent {
    gameTitle: string;
    gameDescription: string;
    selectedTileType: string = '';

    constructor() {
        this.gameTitle = '[ Game Title ]';
        this.gameDescription = '[ Game Description ]';
    }
    changeHeader(title: string, description: string) {
        this.gameTitle = title;
        this.gameDescription = description;
    }

    tempLog(tileType: string) {
        this.selectedTileType = tileType;
    }
}
