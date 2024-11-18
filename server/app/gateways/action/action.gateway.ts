import { ActionHandlerService } from '@app/services/action-handler/action-handler.service';
import { ConnectedSocket, MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
@WebSocketGateway({ cors: { origin: '*' } })
export class ActionGateway implements OnGatewayInit {
    @WebSocketServer() private server: Server;

    constructor(private readonly actionHandler: ActionHandlerService) {}

    // @SubscribeMessage('disconnect')
    // handleDisconnect(@ConnectedSocket() client: Socket, @MessageBody() playerId: string) {
    //     console.log(`Client disconnected: ${client.id}`);

    //     // Add any additional logic you need to handle on client disconnect
    // }

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
        console.log('yooooooo');
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

    // @SubscribeMessage('quitGame')
    // handleQuitGame(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string; playerId: string }) {
    //     this.actionHandler.handleQuitGame(data, this.server, client);
    // }

    afterInit(server: Server) {
        this.server = server;
    }
}
