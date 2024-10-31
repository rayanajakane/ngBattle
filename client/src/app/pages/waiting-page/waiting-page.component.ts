import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { KickedDialogComponent } from '@app/components/kicked-dialog/kicked-dialog.component';
import { NavigateDialogComponent } from '@app/components/navigate-dialog/navigate-dialog.component';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { Player } from '@app/interfaces/player';
import { SocketService } from '@app/services/socket.service';

@Component({
    selector: 'app-waiting-page',
    standalone: true,
    imports: [MatButtonModule, PlayerListComponent, ChatComponent],
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
    maxPlayers: number;
    constructor(
        private socketService: SocketService,
        private router: Router,
        private route: ActivatedRoute,
    ) {}

    ngOnInit() {
        this.socketService.on('maxPlayers', (maxPlayers: number) => {
            this.maxPlayers = maxPlayers;
        });
        this.socketService.once('roomLeft', () => {
            this.router.navigate(['/']);
        });
        this.socketService.once('kicked', () => {
            this.openKickedDialog();
        });
        this.socketService.on('roomLocked', () => {
            const lockButton = document.getElementById('lock-btn');
            console.log(lockButton);
            if (lockButton) {
                lockButton.innerHTML = 'Déverrouiller';
                if (this.players.length === this.maxPlayers) lockButton.setAttribute('disabled', 'true');
            }
        });
        this.socketService.on('roomUnlocked', () => {
            const lockButton = document.getElementById('lock-btn');
            if (lockButton) {
                lockButton.innerHTML = 'Verrouiller';
                lockButton.removeAttribute('disabled');
            }
        });
        this.getPlayers();
        this.updatePlayers();
        this.gameStartedListener();
        this.route.params.subscribe((params) => {
            this.roomId = params.roomId;
            this.playerId = params.playerId;
            this.characterName = params.characterName;
            this.selectedAvatar = params.selectedAvatar;
            this.isAdmin = params.isAdmin === 'true';
            this.socketService.emit('getMaxPlayers', { roomId: this.roomId });
        });
    }

    gameStartedListener() {
        this.socketService.once('gameStarted', () => {
            // TODO: change the url path
            this.router.navigate(['/home']);
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
        this.socketService.on('isRoomLocked', (isRoomLocked: boolean) => {
            if (isRoomLocked) {
                this.socketService.emit('unlockRoom', this.roomId);
            } else {
                this.socketService.emit('lockRoom', this.roomId);
            }
        });
        this.socketService.emit('isRoomLocked', this.roomId);
    }

    deletePlayer(kickedPlayerId: string) {
        this.socketService.emit('kickPlayer', { roomId: this.roomId, playerId: kickedPlayerId });
    }

    startGame() {
        this.socketService.once('startError', (error: string) => {
            this.dialog.open(NavigateDialogComponent, {
                data: {
                    foundErrors: [error],
                },
            });
        });
        this.socketService.emit('startGame', { roomId: this.roomId });
    }
}
