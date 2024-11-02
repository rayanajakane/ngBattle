import { ActionService } from '@app/services/map_state_handler/map_state_handler.service';
import { Inject } from '@nestjs/common';
import { 
  SubscribeMessage, 
  WebSocketGateway, 
  WebSocketServer, 
  ConnectedSocket,
  MessageBody,
 } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class ActionGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer private server: Server;

    constructor(@Inject() private readonly action: ActionService) {}

    afterInit(server: Server) {
        this.server = server;
    }

    @SubscribeMessage('message')
    handleMessage(client: any, payload: any): string {
        return 'Hello world!';
    }

    @SubscribeMessage('gameSetup')
    handleMessage(
      @MessageBody() { gameId: string; players: string[]; },
      @ConnectedSocket() client: Socket): number[] {
        this.action.gameSetup(gameId, players);
    }
}
