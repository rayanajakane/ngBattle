import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Avatar } from '@app/interfaces/avatar';
import { DEFAULT_AVATAR_LIST } from '@app/services/constants';
import { SocketService } from '@app/services/socket.service';
import { Player } from '@common/player';

@Component({
    selector: 'app-virtual-player-page',
    standalone: true,
    imports: [BrowserModule, FormsModule, RouterLink],
    templateUrl: './virtual-player-page.component.html',
    styleUrl: './virtual-player-page.component.scss',
})
export class VirtualPlayerPageComponent {
    roomId: string;
    route: ActivatedRoute;

    playerList: Player[] = [];

    availableAvatars: Avatar[] = DEFAULT_AVATAR_LIST;
    nonAvailableAvatars: Avatar[] = [];

    characterProfile: string = '';

    virtualPlayer: Player;
    virtualAvatar: Avatar;

    availableNames: string[] = ['Kiki', 'Kuku', 'Koko'];

    constructor(private socketService: SocketService) {}

    ngOnInit() {
        this.route.params.subscribe((params) => {
            this.roomId = params.roomId;
        });
        this.getAllPlayers();
    }

    getAllPlayers() {
        this.socketService.on('getPlayers', (players: Player[]) => {
            this.playerList = players;
        });
        this.socketService.emit('getPlayers', this.roomId);
    }

    setAvailableAvatars() {
        this.nonAvailableAvatars = this.playerList.map((player: Player) => {
            return {
                name: player.avatar,
                img: `./assets/characters/${player.avatar.slice(-1)}.png`,
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
        this.socketService.emit('getPlayers', this.roomId);
    }

    createPlayer() {
        this.virtualAvatar = this.availableAvatars[Math.floor(Math.random() * this.availableAvatars.length)];
        const randomIndex = Math.floor(Math.random() * 2);
        const health = randomIndex === 0 ? 6 : 4;
        const speed = randomIndex === 0 ? 4 : 6;
        const dice = Math.random() < 0.5 ? 'attack' : 'defense';

        this.virtualPlayer = {
            id: 'virtual',
            name: this.getAvailableName(),
            isAdmin: false,
            avatar: this.virtualAvatar.name,
            attributes: {
                health: health.toString(),
                speed: speed.toString(),
                attack: '4',
                defense: '4',
                dice: dice,
            },
        };
    }

    getAvailableName(): string {
        const usedNames = this.playerList.map((player) => player.name);
        const availableNames = this.availableNames.filter((name) => !usedNames.includes(name));
        return availableNames.length > 0 ? availableNames[Math.floor(Math.random() * availableNames.length)] : 'DefaultName';
    }
}
