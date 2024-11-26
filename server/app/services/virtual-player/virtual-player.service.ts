import { ActionHandlerService } from '@app/services/action-handler/action-handler.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { ActionService } from '../action/action.service';
import { ActiveGamesService } from '../active-games/active-games.service';

@Injectable()
export class VirtualPlayerService {
    virtualPlayerId: string;
    roomId: string;
    server: Server;

    constructor(
        @Inject(forwardRef(() => ActionHandlerService))
        private readonly actionHandler: ActionHandlerService,
        private readonly activeGamesService: ActiveGamesService,
        private readonly actionService: ActionService,
    ) {}

    afterInit(server: Server) {
        this.server = server;
    }

    move() {
        // const activeGame = this.activeGamesService.getActiveGame(this.roomId);
        // const map = activeGame.game.map;
        // const playerPosition = activeGame.playersCoord.find((player) => player.player.id === this.virtualPlayerId);
        const availablePlayerMoves = this.actionService.availablePlayerMoves(this.virtualPlayerId, this.roomId);
        console.log('Available player moves:', availablePlayerMoves);

        let endPosition: number;
        const accessibleTiles = Object.keys(availablePlayerMoves).map(Number);
        console.log('Accessible tiles:', accessibleTiles);
        endPosition = accessibleTiles[Math.floor(Math.random() * accessibleTiles.length)];
        console.log('Virtual player moves to', endPosition);

        // if (map[endPosition].item === 'door') {
        //     this.actionHandler.handleInteractDoor({ roomId: this.roomId, playerId: this.virtualPlayerId, doorPosition: endPosition }, this.server, null);
        // }
        console.log('Calling handleMove');
        this.actionHandler.handleMove({ roomId: this.roomId, playerId: this.virtualPlayerId, endPosition }, this.server, null);
        console.log('Calling handleEndTurn');
        this.actionHandler.handleEndTurn({ roomId: this.roomId, playerId: this.virtualPlayerId, lastTurn: false }, this.server);
    }
}
