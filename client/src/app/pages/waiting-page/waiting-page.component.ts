import { Component, OnInit } from '@angular/core';
import { JoinMatchService } from '@app/services/join-match.service';

@Component({
    selector: 'app-waiting-page',
    standalone: true,
    imports: [],
    templateUrl: './waiting-page.component.html',
    styleUrl: './waiting-page.component.scss',
})
export class WaitingPageComponent implements OnInit {
    roomId: string;
    playerId: string;
    constructor(private joinMatchService: JoinMatchService) {}

    ngOnInit() {
        this.joinMatchService.on('roomJoined', (data: { roomId: string; playerId: string }) => {
            this.roomId = data.roomId;
            this.playerId = data.playerId;
        });
    }
}
