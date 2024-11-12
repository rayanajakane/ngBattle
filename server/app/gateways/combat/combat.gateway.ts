import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway()
export class CombatGateway {
    constructor() {
        console.log('Combat Gateway created');
    }
    @SubscribeMessage('message')
    handleMessage(client: unknown, payload: unknown): string {
        return 'Hello world!';
    }

    // get available indexes start action

    // start combat action
}
