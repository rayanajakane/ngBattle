import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { AttributeSelectionComponent } from '@app/components/attribute-selection/attribute-selection.component';
import { AvatarSliderComponent } from '@app/components/avatar-slider/avatar-slider.component';
import { SocketService } from '@app/services/socket.service';

interface Player {
    id: string;
    name: string;
    isAdmin: boolean;
    avatar: string;
}

@Component({
    selector: 'app-join-page',
    standalone: true,
    imports: [AvatarSliderComponent, AttributeSelectionComponent, FormsModule, MatButtonModule],
    templateUrl: './join-page.component.html',
    styleUrl: './join-page.component.scss',
})
export class JoinPageComponent {
    @ViewChild('roomCheck') roomCheck: ElementRef;

    roomCode: number;
    isRoomCodeValid: boolean;
    playerList: Player[];
    nonAvailableAvatars: { name: string; img: string }[] = [];

    availableAvatars: { name: string; img: string }[] = [
        { name: 'Avatar 1', img: '../../../assets/characters/1.png' },
        { name: 'Avatar 2', img: '../../../assets/characters/2.png' },
        { name: 'Avatar 3', img: '../../../assets/characters/3.png' },
        { name: 'Avatar 4', img: '../../../assets/characters/4.png' },
        { name: 'Avatar 5', img: '../../../assets/characters/5.png' },
        { name: 'Avatar 6', img: '../../../assets/characters/6.png' },
        { name: 'Avatar 7', img: '../../../assets/characters/7.png' },
        { name: 'Avatar 8', img: '../../../assets/characters/8.png' },
        { name: 'Avatar 9', img: '../../../assets/characters/9.png' },
        { name: 'Avatar 10', img: '../../../assets/characters/10.png' },
        { name: 'Avatar 11', img: '../../../assets/characters/11.png' },
        { name: 'Avatar 12', img: '../../../assets/characters/12.png' },
    ];

    constructor(private readonly socketService: SocketService) {
        this.socketService.connect();
        this.isRoomCodeValid = false;
    }

    async onSubmit(event: Event) {
        event.preventDefault();
        this.socketService.on('validRoom', (isValid: boolean) => {
            this.isRoomCodeValid = isValid;
            this.codeValidationMessage();
        });
        this.socketService.emit('validRoom', this.roomCode);
    }

    codeValidationMessage() {
        if (this.isRoomCodeValid) {
            this.roomCheck.nativeElement.innerText = '';
            this.getAllPlayers();
        } else {
            this.roomCheck.nativeElement.innerText = 'This room is not valid';
        }
    }

    getAllPlayers() {
        this.socketService.on('getPlayers', (players: Player[]) => {
            this.playerList = players;
            this.setAvailableAvatars();
        });
        this.socketService.emit('getPlayers', this.roomCode);
    }

    setAvailableAvatars() {
        this.nonAvailableAvatars = this.playerList.map((player: Player) => {
            return {
                name: player.avatar,
                img: `../../../assets/characters/${player.avatar.slice(-1)}.png`,
            };
        });
        console.log(this.nonAvailableAvatars);
        this.availableAvatars = this.availableAvatars.filter(
            (avatar) => !this.nonAvailableAvatars.some((nonAvailable) => nonAvailable.name === avatar.name),
        );
        console.log(this.availableAvatars);
    }
}
