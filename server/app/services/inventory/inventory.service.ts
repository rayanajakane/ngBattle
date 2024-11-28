import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { Player, PlayerCoord } from '@common/player';
import { ItemTypes } from '@common/tile-types';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
@Injectable()
export class InventoryService {
    constructor(readonly activeGameService: ActiveGamesService) {}

    handleCombatInventory(player: Player, inventory: ItemTypes[]) {
        inventory.forEach((item) => {
            if (item === ItemTypes.AC1 || item === ItemTypes.AC2) {
                this.handleItemEffect(item, player, false);
            }
        });
    }

    handleItemEffect(item: ItemTypes, player: Player, isReset: boolean) {
        switch (item) {
            case ItemTypes.AA1:
                this.handleAA1Item(player, isReset);
            case ItemTypes.AA2:
                this.handleAA2Item(player, isReset);
            case ItemTypes.AC1:
                this.handleAC1Item(player, isReset);
            case ItemTypes.AC2:
                this.handleAC2Item(player, isReset);
            // case ItemTypes.FLAG_A:
            //  this.handleFlagAItem();
            default:
                return;
        }
    }

    inventoryContainsItem(inventory: ItemTypes[], item: ItemTypes) {
        // TODO: important for ice slip
        return inventory.includes(item);
    }

    isInventoryFull(inventory: ItemTypes[]) {
        return inventory.length >= 2;
    }

    handleAA1Item(player: Player, isReset: boolean) {
        player.attributes.defense += 2 * (isReset ? -1 : 1);
    }

    handleAA2Item(player: Player, isReset: boolean) {
        player.attributes.speed += 2 * (isReset ? -1 : 1);
        player.attributes.health -= 1 * (isReset ? -1 : 1);
    }

    handleAC1Item(player: Player, isReset: boolean) {
        if (player.attributes.currentHealth <= 2 && !player.attributes.isCombatBoostedAttack) {
            player.attributes.currentAttack += 2 * (isReset ? -1 : 1);
            player.attributes.isCombatBoostedAttack = !isReset;
        }
    }

    handleAC2Item(player: Player, isReset: boolean) {
        if (player.attributes.currentHealth <= 2 && !player.attributes.isCombatBoostedDefense) {
            player.attributes.currentDefense += 2 * (isReset ? -1 : 1);
            player.attributes.isCombatBoostedDefense = !isReset;
        }
    }

    getSlippingChance(player: Player): number {
        return player.inventory.includes(ItemTypes.AF1) ? 0 : 0.1;
    }

    hasAF2Item(player: Player): boolean {
        return player.inventory.includes(ItemTypes.AF2);
    }

    // TODO: call this function when player finishes a combat
    deactivateCombatBoostAttack(player: Player) {
        player.attributes.currentAttack -= 2;
        player.attributes.isCombatBoostedAttack = false;
    }

    // TODO: call this function when player finishes a combat
    deactivateCombatBoostDefense(player: Player) {
        player.attributes.currentSpeed -= 2;
        player.attributes.isCombatBoostedDefense = false;
    }

    addToInventoryAndEmit(server: Server, client: Socket, roomId: string, player: PlayerCoord, item: ItemTypes) {
        const inventory = player.player.inventory;

        if (this.isInventoryFull(inventory)) {
            this.emitItemToReplace(client, player, item);
        } else {
            inventory.push(item);
            this.handleItemEffect(item, player.player, false);
            this.emitNewPlayerAttributes(server, roomId, player);
        }
    }

    emitItemToReplace(client: Socket, player: PlayerCoord, newItem: ItemTypes) {
        // TODO: emit to client to choose item to replace and to visually hide the item
        client.emit('itemToReplace', player, newItem);
    }

    updateInventory(server: Server, client: Socket, player: PlayerCoord, newInventory: ItemTypes[], droppedItem: ItemTypes, roomId: string) {
        this.activeGameService.getActiveGame(roomId).game.map[player.position].item = droppedItem;

        player.player.inventory.forEach((item) => {
            this.handleItemEffect(item, player.player, true);
        });

        player.player.inventory = newInventory;

        player.player.inventory.forEach((item) => {
            this.handleItemEffect(item, player.player, false);
        });
        this.emitNewPlayerAttributes(server, roomId, player);
    }

    emitNewPlayerAttributes(server: Server, roomId: string, player: PlayerCoord) {
        server.to(roomId).emit('newPlayerAttributes', player);
    }
}
