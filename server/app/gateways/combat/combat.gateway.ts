import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway()
export class CombatGateway {
    @SubscribeMessage('message')
    handleMessage(client: unknown, payload: unknown): string {
        return 'Hello world!';
    }
}
