import { ActionHandlerService } from '@app/services/action-handler/action-handler.service';
import { DebugModeService } from '@app/services/debug-mode/debug-mode.service';
import { ConnectedSocket, MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
@WebSocketGateway({ cors: { origin: '*' } })
export class ActionGateway implements OnGatewayInit {
    @WebSocketServer() private server: Server;

    constructor(
        private readonly actionHandler: ActionHandlerService,
        private debugModeService: DebugModeService,
        private actionHandlerService: ActionHandlerService,
    ) {}

    @SubscribeMessage('gameSetup')
    handleGameSetup(@MessageBody() roomId: string) {
        this.actionHandler.handleGameSetup(this.server, roomId);
    }

    @SubscribeMessage('startTurn')
    handleStartTurn(@MessageBody() data: { roomId: string; playerId: string }, @ConnectedSocket() client: Socket) {
        this.actionHandler.handleStartTurn(data, this.server, client);
    }

    @SubscribeMessage('getAvailableMovesOnBudget')
    handleGetAvailableMovesOnBudget(
        @MessageBody() data: { roomId: string; playerId: string; currentBudget: number },
        @ConnectedSocket() client: Socket,
    ) {
        this.actionHandler.handleGetAvailableMovesOnBudget(data, client);
    }

    @SubscribeMessage('move')
    handleMove(@MessageBody() data: { roomId: string; playerId: string; endPosition: number }, @ConnectedSocket() client: Socket) {
        this.actionHandler.handleMove(data, this.server, client);
    }

    @SubscribeMessage('endTurn')
    handleEndTurn(@MessageBody() data: { roomId: string; playerId: string; lastTurn: boolean }) {
        this.actionHandler.handleEndTurn(data, this.server);
    }

    @SubscribeMessage('interactDoor')
    handleInteractDoor(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string; playerId: string; doorPosition: number }) {
        this.actionHandler.handleInteractDoor(data, this.server, client);
    }

    @SubscribeMessage('debugMode')
    handleDebugMode(@MessageBody() data: { roomId: string; playerId: string }) {
        this.debugModeService.debugModeOn();
        const formattedTime = this.actionHandlerService.getCurrentTimeFormatted();
        this.server
            .to(data.roomId)
            .emit('newLog', { date: formattedTime, message: 'Mode débogage est allumé!', receiver: data.playerId, exclusive: false });
    }

    @SubscribeMessage('stopDebugMode')
    handleStopDebugMode(@MessageBody() data: { roomId: string; playerId: string }) {
        this.debugModeService.debugModeOff();
        const formattedTime = this.actionHandlerService.getCurrentTimeFormatted();
        this.server
            .to(data.roomId)
            .emit('newLog', { date: formattedTime, message: 'Mode débogage est éteint!', receiver: data.playerId, exclusive: false });
    }

    afterInit(server: Server) {
        this.server = server;
    }
}
