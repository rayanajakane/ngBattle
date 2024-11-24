import { ActionHandlerService } from '@app/services/action-handler/action-handler.service';
import { ActionService } from '@app/services/action/action.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { CombatService } from '@app/services/combat/combat.service';
import { PlayerCoord } from '@common/player';
import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class VirtualPlayerService {
    virtualPlayerId: string;
    roomId: string;

    constructor(
        private readonly actionService: ActionService,
        private readonly activeGamesService: ActiveGamesService,
        private readonly actionHandlerService: ActionHandlerService,
        private readonly combatService: CombatService,
    ) {}

    handleVirtualPlayerTurn(server: Server) {
        const gameInstance = this.activeGamesService.getActiveGame(this.roomId);
        const playerCoord = gameInstance.playersCoord.find((player) => player.player.id === this.virtualPlayerId);

        if (!playerCoord || !playerCoord.player.isVirtual) {
            return;
        }

        // Example logic for virtual player actions
        if (this.shouldAttack(playerCoord)) {
            this.performAttack(server, playerCoord);
        } else if (this.shouldMove(playerCoord)) {
            this.performMove(server, playerCoord);
        } else {
            this.endTurn(server, playerCoord);
        }
    }

    private shouldAttack(playerCoord: PlayerCoord): boolean {
        return true; // todo implement logic
    }

    private performAttack(server: Server, playerCoord: PlayerCoord) {
        const target = this.findTarget(playerCoord);
        if (target) {
            this.combatService.startCombat(this.roomId, [playerCoord, target]);
            server.to(this.roomId).emit('startCombat', { attacker: playerCoord, defender: target });
        }
    }

    private shouldMove(playerCoord: PlayerCoord): boolean {
        return true; // todo implement logic
    }

    private performMove(server: Server, playerCoord: PlayerCoord) {
        const availableMoves = this.actionService.availablePlayerMoves(playerCoord.player.id, this.roomId);
        const movePositions = Object.keys(availableMoves).map(Number);
        if (movePositions.length > 0) {
            const targetPosition = movePositions[Math.floor(Math.random() * movePositions.length)];
            this.actionHandlerService.handleMove({ roomId: this.roomId, playerId: this.virtualPlayerId, endPosition: targetPosition }, server, null);
        }
    }

    private endTurn(server: Server, playerCoord: PlayerCoord) {
        this.actionHandlerService.handleEndTurn({ roomId: this.roomId, playerId: this.virtualPlayerId, lastTurn: false }, server);
    }

    private findTarget(playerCoord: PlayerCoord): PlayerCoord | undefined {
        const gameInstance = this.activeGamesService.getActiveGame(this.roomId);
        return gameInstance.playersCoord.find((player) => player.player.id !== playerCoord.player.id && !player.player.isVirtual);
    }
}
