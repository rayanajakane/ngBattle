import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Avatar } from '@app/interfaces/avatar';
import { DEFAULT_AVATAR_LIST } from '@app/services/constants';
import { SocketService } from '@app/services/socket.service';
import { Player } from '@common/player';
import { v4 as generateID } from 'uuid';

@Component({
    selector: 'app-virtual-player-dialog',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './virtual-player-dialog.component.html',
    styleUrl: './virtual-player-dialog.component.scss',
})
export class VirtualPlayerDialogComponent {
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
                    player.avatar.length > 8
                        ? `./assets/characters/${player.avatar.slice(-2)}.png`
                        : `./assets/characters/${player.avatar.slice(-1)}.png`,
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
        const randomIndex = Math.floor(Math.random() * 2);
        const health = randomIndex === 0 ? 6 : 4;
        const speed = randomIndex === 0 ? 4 : 6;
        const dice = Math.random() < 0.5 ? 'attack' : 'defense';

        this.virtualPlayer = {
            id: generateID(),
            name: this.getAvailableName(),
            isAdmin: false,
            avatar: this.virtualAvatar.name,
            attributes: {
                health: health,
                speed: speed.toString(),
                attack: 4,
                defense: 4,
                dice: dice,
            },
            isActive: false,
            abandoned: false,
            wins: 0,
            isVirtual: true,
            virtualProfile: this.characterProfile,
            inventory: [],
            homePosition: 0,
        };
    }

    addVirtualPlayer() {
        this.socketService.on('roomJoined', async (data: { roomId: string; playerId: string; playerName: string }) => {
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
