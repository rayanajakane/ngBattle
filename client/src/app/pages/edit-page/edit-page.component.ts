import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ToolbarComponent } from '../../components/toolbar/toolbar.component';

@Component({
    selector: 'app-edit-page',
    standalone: true,
    imports: [ToolbarComponent, SidebarComponent, MatButtonModule],
    templateUrl: './edit-page.component.html',
    styleUrl: './edit-page.component.scss',
})
export class EditPageComponent {}
