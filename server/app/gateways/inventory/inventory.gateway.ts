import { InventoryService } from '@app/services/inventory/inventory.service';
import { PlayerCoord } from '@common/player';
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
        @MessageBody() data: { player: PlayerCoord; newInventory: ItemTypes[]; droppedItem: ItemTypes; roomId: string },
    ) {
        this.inventoryService.updateInventory(this.server, client, data.player, data.newInventory, data.droppedItem, data.roomId);
    }
}
