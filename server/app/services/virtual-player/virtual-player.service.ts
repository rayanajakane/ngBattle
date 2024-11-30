import { ActionHandlerService } from '@app/services/action-handler/action-handler.service';
import { ActionService } from '@app/services/action/action.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { GameStructure } from '@common/game-structure';
import { PlayerCoord } from '@common/player';
import { ItemTypes } from '@common/tile-types';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { ActionButtonService } from '../action-button/action-button.service';
import { CombatHandlerService } from '../combat-handler/combat-handler.service';
import { InventoryService } from '../inventory/inventory.service';
import { MovementService } from '../movement/movement.service';
import { AGGRESIVE_PRIORITY_ITEMS, DEFENSIVE_PRIORITY_ITEMS } from './constants';

@Injectable()
export class VirtualPlayerService {
    virtualPlayerId: string;
    roomId: string;
    server: Server;

    constructor(
        @Inject(forwardRef(() => ActionHandlerService)) private readonly actionHandler: ActionHandlerService,
        @Inject(forwardRef(() => CombatHandlerService)) private readonly combatHandlerService: CombatHandlerService,
        private readonly inventoryService: InventoryService,
        private readonly actionService: ActionService,
        private readonly activeGames: ActiveGamesService,
        private readonly actionButtonService: ActionButtonService,
        private readonly movementService: MovementService,
    ) {}

    afterInit(server: Server) {
        this.server = server;
    }

    async think() {
        const gameInstance = this.activeGames.activeGames.find((instance) => instance.roomId === this.roomId);
        if (!gameInstance) {
            return;
        }
        const virtualPlayerCoord = gameInstance.playersCoord.find((playerCoord) => playerCoord.player.id === this.virtualPlayerId);
        const virtualPlayerPosition = virtualPlayerCoord.position;

        const nearbyPlayers = this.actionButtonService.getPlayersAround(this.roomId, virtualPlayerPosition);

        await this.waitRandomTime();

        if (nearbyPlayers.length > 0 && !this.isDefensive()) {
            const randomPlayerCoord = nearbyPlayers[Math.floor(Math.random() * nearbyPlayers.length)];
            this.startAttack(randomPlayerCoord);
        } else {
            console.log('Moving to items');
            this.moveToItems();
            //this.move();
        }
    }

    // decides if VP attacks or escapes
    async fight(attacked: boolean) {
        const gameInstance = this.activeGames.activeGames.find((instance) => instance.roomId === this.roomId);
        if (!gameInstance) {
            return;
        }
        await this.waitRandomTime();
        console.log('Done waiting');
        if (this.isDefensive() && attacked) {
            this.combatHandlerService.handleCombatEscape(this.roomId, this.virtualPlayerId, this.server);
        } else {
            this.combatHandlerService.handleCombatAttack(this.roomId, this.virtualPlayerId, this.server);
        }
    }

    waitRandomTime() {
        const waitTime = Math.floor(Math.random() * 2000) + 1000;
        console.log('Waiting for ' + waitTime + 'ms');
        return new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    isDefensive() {
        const gameInstance = this.activeGames.activeGames.find((instance) => instance.roomId === this.roomId);
        const virtualPlayerCoord = gameInstance.playersCoord.find((playerCoord) => playerCoord.player.id === this.virtualPlayerId);
        const profile = virtualPlayerCoord.player.virtualProfile;
        return profile === 'defensive';
    }

    move() {
        const availablePlayerMoves = this.actionService.availablePlayerMoves(this.virtualPlayerId, this.roomId);
        let endPosition: number;
        const accessibleTiles = Object.keys(availablePlayerMoves).map(Number);
        endPosition = accessibleTiles[Math.floor(Math.random() * accessibleTiles.length)];
        this.actionHandler.handleMove({ roomId: this.roomId, playerId: this.virtualPlayerId, endPosition }, this.server, null);
        this.actionHandler.handleEndTurn({ roomId: this.roomId, playerId: this.virtualPlayerId, lastTurn: false }, this.server);
    }

    startAttack(targetPlayerCoord: PlayerCoord) {
        this.combatHandlerService.handleAction(this.roomId, this.virtualPlayerId, targetPlayerCoord.position, null, this.server);
        this.combatHandlerService.handleCombatAttack(this.roomId, this.virtualPlayerId, this.server);
    }

    moveToItems() {
        // open all closed doors on a copy of the map
        console.log('Started move to items logic');
        const gameInstance = this.activeGames.activeGames.find((instance) => instance.roomId === this.roomId);
        if (!gameInstance) {
            return;
        }
        const virtualPlayerCoord = gameInstance.playersCoord.find((playerCoord) => playerCoord.player.id === this.virtualPlayerId);

        let gameStructureOpenedDoors = JSON.parse(JSON.stringify(gameInstance.game)) as GameStructure;
        gameStructureOpenedDoors.map.forEach((tile) => {
            if (tile.tileType === 'doorClosed') {
                console.log('Opening door');
                tile.tileType = 'doorOpen';
            }
        });

        // find Shortest path to each item
        let pathsToItems = [];
        console.log('Finding paths to items');
        gameStructureOpenedDoors.map.forEach((tile) => {
            if (tile.item != '' && tile.item != 'startingPoint') {
                const budget = gameInstance.currentPlayerMoveBudget;
                const item = this.movementService.shortestPath(budget, gameStructureOpenedDoors, virtualPlayerCoord.position, tile.idx);
                console.log('Item:', item);
                pathsToItems.push([item.path, tile.item]);
            }
        });

        const validPaths = pathsToItems.filter((path) => path[0].length !== 0);
        if (validPaths.length === 0) {
            console.log('No valid paths to items found');
            this.move();
            return;
        }

        let itemPriorities;
        if (this.isDefensive()) {
            itemPriorities = DEFENSIVE_PRIORITY_ITEMS;
        } else {
            itemPriorities = AGGRESIVE_PRIORITY_ITEMS;
        }

        // sort items by priority
        validPaths.sort((a, b) => {
            const itemA = a[1];
            const itemB = b[1];
            const priorityA = itemPriorities.indexOf(itemA);
            const priorityB = itemPriorities.indexOf(itemB);
            return priorityA - priorityB;
        });

        // get highest priority item
        const chosenItem = validPaths[0];
        console.log('Chosen item:', chosenItem);
        const chosenItemPath = chosenItem[0];
        const chosenItemName = chosenItem[1];

        let lowestPriorityItem;
        let itemReplace = false;
        const inventory = virtualPlayerCoord.player.inventory;
        console.log('Inventory:', inventory);
        if (this.inventoryService.isInventoryFull(inventory)) {
            // Find the lowest priority item in the inventory
            console.log('Inventory is full');
            lowestPriorityItem = inventory[0];
            let lowestPriorityIndex = 0;
            for (let i = 1; i < inventory.length; i++) {
                if (itemPriorities.indexOf(inventory[i]) > itemPriorities.indexOf(lowestPriorityItem)) {
                    lowestPriorityItem = inventory[i];
                    lowestPriorityIndex = i;
                }
            }
            // Compare the priority of the chosen item with the lowest priority item in the inventory
            if (itemPriorities.indexOf(chosenItemName) < itemPriorities.indexOf(lowestPriorityItem)) {
                // Drop the lowest priority item and pick up the chosen item
                itemReplace = true;
                //this.replaceItem(lowestPriorityItem, chosenItemName);
                // inventory.splice(lowestPriorityIndex, 1);
            } else {
                // Do not pick up the chosen item
                console.log('Not picking up item');
                this.move();
                return;
            }
        }

        const map = gameInstance.game.map;
        const doorIndexes = map.filter((tile) => tile.tileType === 'doorClosed').map((tile) => tile.idx);
        const doorsToOpen = [];

        let lastIndexBeforeDoor = virtualPlayerCoord.position;
        for (const index of chosenItemPath) {
            if (doorIndexes.includes(index)) {
                doorsToOpen.push([lastIndexBeforeDoor, index]);
            } else {
                lastIndexBeforeDoor = index;
            }
        }

        doorsToOpen.forEach((doorCoords) => {
            this.moveToDoor(doorCoords[0]);
            this.interactWithDoor(doorCoords[1]);
        });

        console.log('Moving to item', chosenItemName);
        this.actionHandler.handleMove(
            { roomId: this.roomId, playerId: this.virtualPlayerId, endPosition: chosenItemPath[chosenItemPath.length - 1] },
            this.server,
            null,
        );

        console.log('ItemReplace?:', itemReplace);
        console.log('Lowest priority item:', lowestPriorityItem);
        if (itemReplace) {
            this.replaceItem(lowestPriorityItem, chosenItemName);
        }
        this.actionHandler.handleEndTurn({ roomId: this.roomId, playerId: this.virtualPlayerId, lastTurn: false }, this.server);
    }

    replaceItem(droppedItem, collectedItem: ItemTypes) {
        const gameInstance = this.activeGames.activeGames.find((instance) => instance.roomId === this.roomId);
        if (!gameInstance) {
            return;
        }
        const virtualPlayerCoord = gameInstance.playersCoord.find((playerCoord) => playerCoord.player.id === this.virtualPlayerId);
        const allItems = [...virtualPlayerCoord.player.inventory, collectedItem];
        this.inventoryService.updateInventory(this.server, null, this.virtualPlayerId, allItems, droppedItem, this.roomId);
    }

    moveToDoor(tileBeforeDoor: number) {
        console.log('Moving to door', tileBeforeDoor);
        this.actionHandler.handleMove({ roomId: this.roomId, playerId: this.virtualPlayerId, endPosition: tileBeforeDoor }, this.server, null);
    }

    interactWithDoor(doorPosition: number) {
        this.combatHandlerService.handleAction(this.roomId, this.virtualPlayerId, doorPosition, null, this.server);
    }
}
