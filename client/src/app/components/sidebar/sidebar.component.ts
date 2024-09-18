import { Component } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    imports: [MatGridListModule],
})
export class SidebarComponent {}
