import { Component } from '@angular/core';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';

@Component({
    selector: 'app-game-page',
    standalone: true,
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
    imports: [SidebarComponent],
})
export class GamePageComponent {}
