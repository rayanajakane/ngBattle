import { Component, OnInit } from '@angular/core';
import { SocketService } from '@app/services/socket.service';

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
    constructor(private joinMatchService: SocketService) {}

    ngOnInit() {
        this.joinMatchService.on('roomJoined', (data: { roomId: string; playerId: string }) => {
            this.roomId = data.roomId;
            this.playerId = data.playerId;
        });
    }
}
