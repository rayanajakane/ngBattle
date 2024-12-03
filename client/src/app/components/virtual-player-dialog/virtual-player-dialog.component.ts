import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Avatar } from '@app/interfaces/avatar';
import { DEFAULT_AVATAR_LIST } from '@app/services/constants';
import { SocketService } from '@app/services/socket.service';
import { Player, PlayerStats } from '@common/player';
import { v4 as generateID } from 'uuid';
import { FOUR, HEIGHT, MINUS_ONE, MINUS_TWO, SIX, TWO, ZERO_POINT_FIVE } from '@app/components/virtual-player-dialog/virtual-player-dialog.utils';

@Component({
    selector: 'app-virtual-player-dialog',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './virtual-player-dialog.component.html',
    styleUrl: './virtual-player-dialog.component.scss',
})
export class VirtualPlayerDialogComponent implements OnInit {
    dialog = inject(MatDialog);
    data = inject(MAT_DIALOG_DATA);
    playerList: Player[] = [];
    availableAvatars: Avatar[] = DEFAULT_AVATAR_LIST;
    nonAvailableAvatars: Avatar[] = [];
    characterProfile: string = '';
    virtualPlayer: Player;
    virtualAvatar: Avatar;
    availableNames: string[] = ['Kiki', 'Kuku', 'Koko', 'Kaka', 'Kiko'];

    constructor(private socketService: SocketService) {}

    ngOnInit() {
        this.getAllPlayers();
    }

    getAllPlayers() {
        this.socketService.on('getPlayers', (players: Player[]) => {
            this.playerList = players;
        });
        this.socketService.emit('getPlayers', this.data.roomId);
    }

    setAvailableAvatars() {
        this.nonAvailableAvatars = this.playerList.map((player: Player) => {
            return {
                name: player.avatar,
                img:
                    player.avatar.length > HEIGHT
                        ? `./assets/characters/${player.avatar.slice(MINUS_TWO)}.png`
                        : `./assets/characters/${player.avatar.slice(MINUS_ONE)}.png`,
            };
        });
        this.availableAvatars = this.availableAvatars.filter(
            (avatar) => !this.nonAvailableAvatars.some((nonAvailable) => nonAvailable.name === avatar.name),
        );
    }

    randomizePlayer() {
        this.socketService.on('getPlayers', (players: Player[]) => {
            this.playerList = players;
            this.setAvailableAvatars();
            this.createPlayer();
        });
        this.socketService.emit('getPlayers', this.data.roomId);
    }

    createPlayer() {
        this.virtualAvatar = this.availableAvatars[Math.floor(Math.random() * this.availableAvatars.length)];
        const randomIndex = Math.floor(Math.random() * TWO);
        const health = randomIndex === 0 ? SIX : FOUR;
        const speed = randomIndex === 0 ? FOUR : SIX;
        const dice = Math.random() < ZERO_POINT_FIVE ? 'attack' : 'defense';

        this.virtualPlayer = {
            id: generateID(),
            name: this.getAvailableName(),
            isAdmin: false,
            avatar: this.virtualAvatar.name,
            attributes: {
                health,
                speed,
                attack: 4,
                defense: 4,
                dice,
            },
            isActive: false,
            abandoned: false,
            wins: 0,
            isVirtual: true,
            virtualProfile: this.characterProfile,
            inventory: [],
            stats: {} as PlayerStats,
            homePosition: 0,
        };
    }

    addVirtualPlayer() {
        this.socketService.on('roomJoined', async () => {
            this.dialog.closeAll();
        });

        this.socketService.emit('joinRoom', {
            roomId: this.data.roomId,
            playerName: this.virtualPlayer.name.trim(),
            avatar: this.virtualAvatar.name,
            attributes: this.virtualPlayer.attributes,
            isVirtual: true,
            virtualProfile: this.characterProfile,
        });
    }

    getAvailableName(): string {
        const usedNames = this.playerList.map((player) => player.name);
        const availableNames = this.availableNames.filter((name) => !usedNames.includes(name));
        return availableNames.length > 0 ? availableNames[Math.floor(Math.random() * availableNames.length)] : 'DefaultName';
    }
}
