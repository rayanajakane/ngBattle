import { PlayerCoord } from '@common/player';
import { ItemTypes } from '@common/tile-types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InventoryService {
    handleCombatInventory(player: PlayerCoord, inventory: ItemTypes[]) {
        inventory.forEach((item) => {
            if (item === ItemTypes.AC1 || item === ItemTypes.AC2) {
                this.handleItemEffect(item, player, false);
            }
        });
    }

    handleItemEffect(item: ItemTypes, player: PlayerCoord, isReset: boolean) {
        switch (item) {
            case ItemTypes.AA1:
                this.handleAA1Item(player, isReset);
            case ItemTypes.AA2:
                this.handleAA2Item(player, isReset);
            case ItemTypes.AC1:
                this.handleAC1Item(player, isReset);
            case ItemTypes.AC2:
                this.handleAC2Item(player, isReset);
            // case ItemTypes.AF1:
            //     return this.handleAF1Item();
            // case ItemTypes.AF2:
            //     return this.handleAF2Item();
            // case ItemTypes.FLAG_A:
            //     return this.handleFlagAItem();
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

    handleAA1Item(player: PlayerCoord, isReset: boolean) {
        player.player.attributes.defense += 2 * (isReset ? -1 : 1);
    }

    handleAA2Item(player: PlayerCoord, isReset: boolean) {
        player.player.attributes.speed += 2 * (isReset ? -1 : 1);
        player.player.attributes.health -= 1 * (isReset ? -1 : 1);
    }

    handleAC1Item(player: PlayerCoord, isReset: boolean) {
        if (player.player.attributes.currentHealth <= 2 && !player.player.attributes.isCombatBoostedAttack) {
            player.player.attributes.currentAttack += 2 * (isReset ? -1 : 1);
            player.player.attributes.isCombatBoostedAttack = !isReset;
        }
    }

    handleAC2Item(player: PlayerCoord, isReset: boolean) {
        if (player.player.attributes.currentHealth <= 2 && !player.player.attributes.isCombatBoostedSpeed) {
            player.player.attributes.currentSpeed += 2 * (isReset ? -1 : 1);
            player.player.attributes.isCombatBoostedSpeed = !isReset;
        }
    }

    // TODO: call this function when player finishes a combat
    deactivateCombatBoostAttack(player: PlayerCoord) {
        player.player.attributes.currentAttack -= 2;
        player.player.attributes.isCombatBoostedAttack = false;
    }

    // TODO: call this function when player finishes a combat
    deactivateCombatBoostSpeed(player: PlayerCoord) {
        player.player.attributes.currentSpeed -= 2;
        player.player.attributes.isCombatBoostedSpeed = false;
    }

    addToInventory(playerPosition: number, player: PlayerCoord, item: ItemTypes) {
        const inventory = player.player.inventory;

        if (this.isInventoryFull(inventory)) {
            this.listenForItemReplace(player, inventory, item);
            this.emitItemToReplace(player, item);
        } else {
            inventory.push(item);
            this.handleItemEffect(item, player, false);
            this.emitNewPlayerAttributes(player);
        }
    }

    emitItemToReplace(player: PlayerCoord, newItem: ItemTypes) {
        // TODO: emit to client to choose item to replace
    }

    emitNewPlayerAttributes(player: PlayerCoord) {}

    listenForItemReplace(player: PlayerCoord, newInventory: ItemTypes[], dropedItem: ItemTypes) {
        // TODO: listen for item to replace emit from client with socket.once

        player.player.inventory.forEach((item) => {
            this.handleItemEffect(item, player, true);
        });
        player.player.inventory = newInventory;

        player.player.inventory.forEach((item) => {
            this.handleItemEffect(item, player, false);
        });

        this.emitNewPlayerAttributes(player);
    }
}
