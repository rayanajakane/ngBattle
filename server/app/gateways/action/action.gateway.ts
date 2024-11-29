import { ActionHandlerService } from '@app/services/action-handler/action-handler.service';
import { DebugModeService } from '@app/services/debug-mode/debug-mode.service';
import { InventoryService } from '@app/services/inventory/inventory.service';
import { LogSenderService } from '@app/services/log-sender/log-sender.service';
import { PlayerCoord } from '@common/player';
import { ItemTypes } from '@common/tile-types';
import { ConnectedSocket, MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
@WebSocketGateway({ cors: { origin: '*' } })
export class ActionGateway implements OnGatewayInit {
    @WebSocketServer() private server: Server;
    gateway: import('http').Server<typeof import('http').IncomingMessage, typeof import('http').ServerResponse>;

    constructor(
        private readonly actionHandler: ActionHandlerService,
        private readonly inventoryService: InventoryService,
        private debugModeService: DebugModeService,
        private logSenderService: LogSenderService,
    ) {}

    @SubscribeMessage('gameSetup')
    handleGameSetup(@MessageBody() roomId: string) {
        this.actionHandler.handleGameSetup(this.server, roomId);
    }

    @SubscribeMessage('startTurn')
    handleStartTurn(@MessageBody() data: { roomId: string; playerId: string }, @ConnectedSocket() client: Socket) {
        this.actionHandler.handleStartTurn(data, this.server, client);
    }

    @SubscribeMessage('move')
    handleMove(@MessageBody() data: { roomId: string; playerId: string; endPosition: number }, @ConnectedSocket() client: Socket) {
        this.actionHandler.handleMove(data, this.server, client);
    }

    @SubscribeMessage('itemReplace')
    itemReplace(@MessageBody() data: { player: PlayerCoord; newInventory: ItemTypes[]; dropedItem: ItemTypes }, @ConnectedSocket() client: Socket) {
        //this.inventoryService.listenForItemReplace(data, this.server, client);
    }

    @SubscribeMessage('endTurn')
    handleEndTurn(@MessageBody() data: { roomId: string; playerId: string; lastTurn: boolean }) {
        this.actionHandler.handleEndTurn(data, this.server);
    }

    @SubscribeMessage('interactDoor')
    handleInteractDoor(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string; playerId: string; doorPosition: number }) {
        this.actionHandler.handleInteractDoor(data, this.server, client);
    }

    @SubscribeMessage('requestDebugMode')
    handleDebugMode(@MessageBody() data: { roomId: string; playerId: string }) {
        this.debugModeService.switchDebugMode(data.roomId);
        const isDebugMode = this.debugModeService.getDebugMode(data.roomId);

        this.logSenderService.sendDebugModeLog(this.server, data.roomId, data.playerId, isDebugMode);
        this.server.to(data.roomId).emit('responseDebugMode', { isDebugMode: this.debugModeService.getDebugMode(data.roomId) });
    }

    @SubscribeMessage('turnOffDebugMode')
    handleTurnOffDebugMode(@MessageBody() data: { roomId: string; playerId: string }) {
        this.debugModeService.debugModeOff(data.roomId);
    }

    afterInit(server: Server) {
        this.server = server;
    }
}
