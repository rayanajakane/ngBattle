import { Injectable } from '@angular/core';
import { DELAY } from '@app/pages/game-page/constant';
import { SocketService } from '@app/services/socket.service';
import { Player, PlayerCoord } from '@common/player';

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

    fighters: PlayerCoord[] = [];

    constructor(private readonly socketService: SocketService) {}

    setFighters(fighters: PlayerCoord[]): void {
        this.fighters = fighters;
    }

    getFighters(): PlayerCoord[] {
        return this.fighters;
    }

    resetFighters(): void {
        this.fighters = [];
    }

    isFighter(fighters: PlayerCoord[]): boolean {
        return fighters.some((fighter) => fighter.player.id === this.player.id);
    }

    isInCombat(): boolean {
        return this.fighters.length > 0;
    }

    updatePlayerCoords(playerCoord: PlayerCoord): void {
        const index = this.playerCoords.findIndex((coord) => coord.player.id === playerCoord.player.id);
        if (index !== -1) {
            this.playerCoords[index] = playerCoord;
        }
    }

    updatePlayer(playerCoord: PlayerCoord): void {
        if (this.player.id === playerCoord.player.id) {
            this.player = playerCoord.player;
        }
    }

    updatePlayerCoordsList(playerCoords: PlayerCoord[]): void {
        playerCoords.forEach((playerCoord) => {
            this.updatePlayerCoords(playerCoord);
            this.updatePlayer(playerCoord);
        });
    }

    getPlayerCoords(): PlayerCoord[] {
        return this.playerCoords;
    }

    findPlayerCoordById(playerId: string): PlayerCoord | undefined {
        return this.playerCoords.find((playerCoord) => playerCoord.player.id === playerId);
    }

    findPlayerCoordByPosition(position: number): PlayerCoord | undefined {
        return this.playerCoords.find((playerCoord) => playerCoord.position === position);
    }

    setRoomId(roomId: string): void {
        this.roomId = roomId;
    }

    setPlayerId(playerId: string): void {
        this.playerId = playerId;
    }

    setActivePlayer(activePlayerId: string): void {
        const activePlayer = this.findPlayerCoordById(activePlayerId)?.player;
        if (activePlayer) {
            this.activePlayer = activePlayer;
        }
    }

    setPlayer(player: Player): void {
        this.player = player;
    }

    isActivePlayer(): boolean {
        return this.activePlayer.id === this.player.id;
    }

    removePlayerFromPlayerCoord(playerId: string): void {
        this.playerCoords = this.playerCoords.filter((playerCoord) => playerCoord.player.id !== playerId);
    }

    feedAfkList(afkPlayerId: string): void {
        const afkPlayerCoord = this.findPlayerCoordById(afkPlayerId);
        if (afkPlayerCoord) {
            this.afklist.push(afkPlayerCoord);
            this.removePlayerFromPlayerCoord(afkPlayerId);
        }
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

    requestEndTurn(lastTurn: boolean = false): void {
        this.socketService.emit('endTurn', { roomId: this.roomId, playerId: this.player.id, lastTurn });
    }

    requestStartAction(): void {
        if (this.activePlayer.id === this.player.id) {
            this.socketService.emit('startAction', { roomId: this.roomId, playerId: this.player.id });
        }
    }

    requestCheckAction(): void {
        this.socketService.emit('checkAction', { roomId: this.roomId, playerId: this.player.id });
    }

    // change back-end
    requestAction(target: number): void {
        this.socketService.emit('action', { roomId: this.roomId, playerId: this.player.id, target });
    }

    requestCombatAction(combatAction: string): void {
        this.socketService.emit(combatAction, { roomId: this.roomId, playerId: this.player.id });
    }

    requestAvailableMovesOnBudget(currentBudget: number): void {
        this.socketService.emit('getAvailableMovesOnBudget', { roomId: this.roomId, playerId: this.player.id, currentBudget });
    }

    requestQuitGame(): void {
        this.socketService.emit('quitGame', { roomId: this.roomId, playerId: this.player.id });
    }

    requestEndCombat(): void {
        this.socketService.emit('endCombat', { roomId: this.roomId, playerId: this.player.id });
    }
}
