import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { KickedDialogComponent } from '@app/components/kicked-dialog/kicked-dialog.component';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { Player } from '@app/interfaces/player';
import { SocketService } from '@app/services/socket.service';

@Component({
    selector: 'app-waiting-page',
    standalone: true,
    imports: [MatButtonModule, PlayerListComponent],
    templateUrl: './waiting-page.component.html',
    styleUrl: './waiting-page.component.scss',
})
export class WaitingPageComponent implements OnInit {
    dialog = inject(MatDialog);

    roomId: string;
    characterName: string;
    selectedAvatar: string;
    playerId: string;
    players: Player[] = [];
    isAdmin: boolean;
    constructor(
        private socketService: SocketService,
        private router: Router,
        private route: ActivatedRoute,
    ) {}

    ngOnInit() {
        this.socketService.once('roomLeft', () => {
            this.router.navigate(['/']);
        });
        this.socketService.once('kicked', () => {
            this.openKickedDialog();
        });
        this.getPlayers();
        this.updatePlayers();
        this.route.params.subscribe((params) => {
            this.roomId = params.roomId;
            this.playerId = params.playerId;
            this.characterName = params.characterName;
            this.selectedAvatar = params.selectedAvatar;
            this.isAdmin = params.isAdmin === 'true' ? true : false;
        });
    }

    getPlayers() {
        this.socketService.once('getPlayers', (players: Player[]) => {
            this.players = players;
        });
        this.socketService.emit('getPlayers', this.roomId);
    }

    updatePlayers() {
        this.socketService.on('updatePlayers', (players: Player[]) => {
            this.players = players;
        });
    }

    openKickedDialog() {
        this.dialog.open(KickedDialogComponent, {
            data: {
                message: 'Vous avez été expulsé de la partie',
            },
        });
    }

    lockRoom() {
        this.socketService.on('validRoom', (isRoomUnlocked) => {
            if (isRoomUnlocked) {
                this.socketService.emit('lockRoom', this.roomId);
            } else {
                this.socketService.emit('unlockRoom', this.roomId);
            }
        });
        this.socketService.emit('validRoom', this.roomId);
    }

    deletePlayer(kickedPlayerId: string) {
        this.socketService.emit('kickPlayer', { roomId: this.roomId, playerId: kickedPlayerId });
    }
}
