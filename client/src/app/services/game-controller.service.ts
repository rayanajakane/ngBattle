import { inject, Injectable } from '@angular/core';
import { DELAY } from '@app/pages/game-page/constant';
import { SocketService } from '@app/services/socket.service';
import { Player, PlayerCoord } from '@common/player';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameControllerService {
    activePlayer: Player;
    player: Player;

    playerCoords: PlayerCoord[];
    afklist: PlayerCoord[] = [];
    playersInitialized: boolean = false;

    roomId: string;
    playerId: string;

    turn: number = 0;

    private playersInitializedSubject = new BehaviorSubject<boolean>(false); // Initial value of false
    playersInitializedBool$ = this.playersInitializedSubject.asObservable(); // Observable for components to subscribe to

    private readonly socketService = inject(SocketService);

    constructor() {}

    getPlayerCoords(): PlayerCoord[] {
        return this.playerCoords;
    }

    setRoomId(roomId: string): void {
        this.roomId = roomId;
    }

    setPlayerId(playerId: string): void {
        this.playerId = playerId;
    }

    requestGameSetup(isAdmin: boolean): void {
        if (isAdmin) {
            setTimeout(() => {
                this.socketService.emit('gameSetup', this.roomId);
            }, DELAY);
        }
    }

    initializePlayers(playerCoords: PlayerCoord[], turn: number) {
        this.playerCoords = playerCoords;
        for (const playerCoord of this.playerCoords) {
            if (playerCoord.player.id === this.playerId) {
                this.player = playerCoord.player;
                break;
            }
        }
        this.activePlayer = this.playerCoords[turn].player; // the array playerCoords is set in order of player turns
    }

    requestStartTurn(): void {
        if (this.activePlayer.id === this.player.id) {
            this.socketService.emit('startTurn', { roomId: this.roomId, playerId: this.player.id });
        }
    }

    requestMove(endPosition: number): void {
        this.socketService.emit('move', { roomId: this.roomId, playerId: this.player.id, endPosition });
    }

    requestStartAction(): void {
        this.socketService.emit('startAction', { roomId: this.roomId, playerId: this.player.id });
    }

    // change back-end
    requestAction(target: number): void {
        this.socketService.emit('action', { roomId: this.roomId, playerId: this.player.id, target });
    }

    // listenStartTurn() {
    //     this.socketService.on('startTurn', (shortestPathByTile: ShortestPathByTile) => {
    //         this.initializeMovementPrevisualization(shortestPathByTile);
    //         this.subscribeMapService();
    //     });
    // }
}
