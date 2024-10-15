import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-timer',
    standalone: true,
    imports: [MatButtonModule, MatIconModule],
    templateUrl: './timer.component.html',
    styleUrl: './timer.component.scss',
})
export class TimerComponent {}
