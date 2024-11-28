import { InventoryService } from '@app/services/inventory/inventory.service';
import { ItemTypes } from '@common/tile-types';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class InventoryGateway {
    @WebSocketServer() server: Server;
    constructor(private readonly inventoryService: InventoryService) {}

    @SubscribeMessage('updateInventory')
    handleUpdateInventory(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { roomId: string; playerId: string; newInventory: ItemTypes[]; droppedItem: ItemTypes },
    ) {
        this.inventoryService.updateInventory(this.server, client, data.playerId, data.newInventory, data.droppedItem, data.roomId);
    }
}
