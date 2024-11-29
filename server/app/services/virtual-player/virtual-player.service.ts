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
        gameStructureOpenedDoors.map.forEach((tile) => {
            if (tile.item != '' && tile.item != 'startingPoint') {
                const budget = gameInstance.currentPlayerMoveBudget;
                const item = this.movementService.shortestPath(budget, gameStructureOpenedDoors, virtualPlayerCoord.position, tile.idx, false);
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

        validPaths.sort((a, b) => {
            const itemA = a[1];
            const itemB = b[1];
            const priorityA = itemPriorities.indexOf(itemA);
            const priorityB = itemPriorities.indexOf(itemB);
            return priorityA - priorityB;
        });

        const chosenItem = validPaths[0];
        const chosenItemPath = chosenItem[0];
        const verifiedInventory = this.verifyInventoryPriority(chosenItem[1]);
        if (!verifiedInventory[0]) {
            this.move();
            return;
        }

        // make sure player doesn't go through door
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

        if (virtualPlayerCoord.player.inventory.length === 2) {
            this.pickUpItem(verifiedInventory[1], chosenItem[1]);
        }
        this.actionHandler.handleMove(
            { roomId: this.roomId, playerId: this.virtualPlayerId, endPosition: chosenItemPath[chosenItemPath.length - 1] },
            this.server,
            null,
        );
        this.actionHandler.handleEndTurn({ roomId: this.roomId, playerId: this.virtualPlayerId, lastTurn: false }, this.server);
    }

    verifyInventoryPriority(item: ItemTypes): [boolean, ItemTypes?] {
        const gameInstance = this.activeGames.activeGames.find((instance) => instance.roomId === this.roomId);
        if (!gameInstance) {
            return;
        }
        const virtualPlayerCoord = gameInstance.playersCoord.find((playerCoord) => playerCoord.player.id === this.virtualPlayerId);
        const inventory = virtualPlayerCoord.player.inventory;
        console.log(inventory);
        if (inventory.length === 2) {
            console.log('Inventory full');
            inventory.forEach((inventoryItem) => {
                if (this.isDefensive()) {
                    if (DEFENSIVE_PRIORITY_ITEMS.indexOf(inventoryItem) < DEFENSIVE_PRIORITY_ITEMS.indexOf(item)) {
                        return [false, null];
                    }
                    return [true, inventoryItem];
                    // inventory.push(item);
                    // this.inventoryService.updateInventory(this.server, null, this.virtualPlayerId, inventory, inventoryItem, this.roomId);
                } else {
                    if (AGGRESIVE_PRIORITY_ITEMS.indexOf(inventoryItem) < AGGRESIVE_PRIORITY_ITEMS.indexOf(item)) {
                        return [false, null];
                    }
                    return [true, inventoryItem];
                    // inventory.push(item);
                    // this.inventoryService.updateInventory(this.server, null, this.virtualPlayerId, inventory, inventoryItem, this.roomId);
                }
            });
        }
        return [true, null];
    }

    pickUpItem(inventoryItem, item: ItemTypes) {
        const gameInstance = this.activeGames.activeGames.find((instance) => instance.roomId === this.roomId);
        if (!gameInstance) {
            return;
        }
        const virtualPlayerCoord = gameInstance.playersCoord.find((playerCoord) => playerCoord.player.id === this.virtualPlayerId);
        const inventory = virtualPlayerCoord.player.inventory;
        inventory.push(item);
        this.inventoryService.updateInventory(this.server, null, this.virtualPlayerId, inventory, inventoryItem, this.roomId);
    }

    moveToDoor(tileBeforeDoor: number) {
        console.log('Moving to door', tileBeforeDoor);
        this.actionHandler.handleMove({ roomId: this.roomId, playerId: this.virtualPlayerId, endPosition: tileBeforeDoor }, this.server, null);
    }

    interactWithDoor(doorPosition: number) {
        this.combatHandlerService.handleAction(this.roomId, this.virtualPlayerId, doorPosition, null, this.server);
    }
}
