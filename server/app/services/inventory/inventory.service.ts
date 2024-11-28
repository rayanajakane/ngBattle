import { Player } from '@common/player';
import { ItemTypes } from '@common/tile-types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InventoryService {
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

    addToInventory(playerPosition: number, player: Player, item: ItemTypes) {
        const inventory = player.inventory;

        if (this.isInventoryFull(inventory)) {
            this.listenForItemReplace(player, inventory, item);
            this.emitItemToReplace(player, item);
        } else {
            inventory.push(item);
            this.handleItemEffect(item, player, false);
            this.emitNewPlayerAttributes(player);
        }
    }

    emitItemToReplace(player: Player, newItem: ItemTypes) {
        // TODO: emit to client to choose item to replace
    }

    emitNewPlayerAttributes(player: Player) {}

    listenForItemReplace(player: Player, newInventory: ItemTypes[], droppedItem: ItemTypes) {
        // TODO: listen for item to replace emit from client with socket.once

        player.inventory.forEach((item) => {
            this.handleItemEffect(item, player, true);
        });
        player.inventory = newInventory;

        player.inventory.forEach((item) => {
            this.handleItemEffect(item, player, false);
        });

        this.emitNewPlayerAttributes(player);
    }
}
