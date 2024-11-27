import { ActionHandlerService } from '@app/services/action-handler/action-handler.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { ActionService } from '../action/action.service';

@Injectable()
export class VirtualPlayerService {
    virtualPlayerId: string;
    roomId: string;
    server: Server;

    constructor(
        @Inject(forwardRef(() => ActionHandlerService))
        private readonly actionHandler: ActionHandlerService,
        private readonly actionService: ActionService,
    ) {}

    afterInit(server: Server) {
        this.server = server;
    }

    action() {}

    move() {
        const availablePlayerMoves = this.actionService.availablePlayerMoves(this.virtualPlayerId, this.roomId);
        let endPosition: number;
        const accessibleTiles = Object.keys(availablePlayerMoves).map(Number);
        endPosition = accessibleTiles[Math.floor(Math.random() * accessibleTiles.length)];
        this.actionHandler.handleMove({ roomId: this.roomId, playerId: this.virtualPlayerId, endPosition }, this.server, null);
        this.actionHandler.handleEndTurn({ roomId: this.roomId, playerId: this.virtualPlayerId, lastTurn: false }, this.server);
    }

    attack() {}

    interactWithDoor() {}
}
