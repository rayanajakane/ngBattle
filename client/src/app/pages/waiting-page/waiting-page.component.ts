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
    isRoomLocked: boolean = false;
    gameId: string;

    constructor(
        private socketService: SocketService,
        private router: Router,
        private route: ActivatedRoute,
    ) {}

    ngOnInit() {
        console.log(this.socketService.id());
        this.socketService.once('roomLeft', () => {
            this.router.navigate(['/']);
        });
        this.socketService.once('kicked', () => {
            this.openKickedDialog();
        });
        this.getPlayers();
        this.updatePlayers();

        this.roomId = this.route.snapshot.params['roomId'];
        this.playerId = this.route.snapshot.params['playerId'];
        this.characterName = this.route.snapshot.params['characterName'];
        this.selectedAvatar = this.route.snapshot.params['selectedAvatar'];
        this.isAdmin = this.route.snapshot.params['isAdmin'] === 'true' ? true : false;

        this.gameStartedListener();
    }

    gameStartedListener() {
        this.socketService.once('gameStarted', (data: { gameId: string; players: Player[] }) => {
            //players might not be necessary
            // TODO: change the url path
            this.router.navigate([
                '/game',
                {
                    playerId: this.playerId,
                    gameId: data.gameId,
                    roomId: this.roomId,
                },
            ]);
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
            this.isRoomLocked = !isRoomLocked;
            console.log('isRoomLocked', this.isRoomLocked);
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
