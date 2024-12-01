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

        await this.waitRandomTime();

        if (this.isDefensive()) {
            this.defensiveThink(virtualPlayerPosition);
        } else {
            this.aggressiveThink(virtualPlayerPosition);
        }

        this.actionHandler.handleEndTurn({ roomId: this.roomId, playerId: this.virtualPlayerId, lastTurn: false }, this.server);
    }

    defensiveThink(position: number) {
        if (Math.random() < 0.1) {
            this.move();
            return;
        }
        if (!this.moveToItems()) {
            if (this.moveToPlayers()) {
                const nearbyPlayers = this.actionButtonService.getPlayersAround(this.roomId, position);
                console.log('Nearby players:', nearbyPlayers);
                const randomPlayerCoord = nearbyPlayers[Math.floor(Math.random() * nearbyPlayers.length)];
                this.startAttack(randomPlayerCoord);
            } else {
                this.move();
                return;
            }
        }
    }

    aggressiveThink(position: number) {
        if (Math.random() < 0.1) {
            this.move();
            return;
        }
        if (!this.moveToPlayers()) {
            if (!this.moveToItems()) this.move();
        } else {
            const nearbyPlayers = this.actionButtonService.getPlayersAround(this.roomId, position);
            console.log('Nearby players:', nearbyPlayers);
            const randomPlayerCoord = nearbyPlayers[Math.floor(Math.random() * nearbyPlayers.length)];
            this.startAttack(randomPlayerCoord);
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
    }

    startAttack(targetPlayerCoord: PlayerCoord) {
        console.log(targetPlayerCoord);
        this.combatHandlerService.handleAction(this.roomId, this.virtualPlayerId, targetPlayerCoord.position, null, this.server);
        this.combatHandlerService.handleCombatAttack(this.roomId, this.virtualPlayerId, this.server);
    }

    moveToItems() {
        const gameInstance = this.activeGames.activeGames.find((instance) => instance.roomId === this.roomId);
        if (!gameInstance) {
            return;
        }
        const virtualPlayerCoord = gameInstance.playersCoord.find((playerCoord) => playerCoord.player.id === this.virtualPlayerId);

        const gameStructureOpenedDoors = this.openAllDoors(gameInstance.game);
        const pathsToItems = this.findPathsToItems(gameStructureOpenedDoors, virtualPlayerCoord.position, gameInstance.currentPlayerMoveBudget);

        const validPaths = pathsToItems.filter((path) => path[0].length !== 0);
        if (validPaths.length === 0) {
            console.log('No valid paths to items found');
            return false;
        }

        const itemPriorities = this.isDefensive() ? DEFENSIVE_PRIORITY_ITEMS : AGGRESIVE_PRIORITY_ITEMS;

        validPaths.sort((a, b) => {
            const itemA = a[1];
            const itemB = b[1];
            const priorityA = itemPriorities.indexOf(itemA);
            const priorityB = itemPriorities.indexOf(itemB);
            return priorityA - priorityB;
        });

        const chosenItem = validPaths[0];
        console.log('Chosen item:', chosenItem);
        const chosenItemPath = chosenItem[0];
        const chosenItemName = chosenItem[1];

        let lowestPriorityItem;
        let willReplaceItem = false;
        const inventory = virtualPlayerCoord.player.inventory;
        console.log('Inventory:', inventory);
        if (this.inventoryService.isInventoryFull(inventory)) {
            console.log('Inventory is full');
            lowestPriorityItem = this.findLowestPriorityItem(inventory, itemPriorities);
            if (itemPriorities.indexOf(chosenItemName) < itemPriorities.indexOf(lowestPriorityItem)) {
                willReplaceItem = true;
            } else {
                console.log('Not picking up item');
                return false;
            }
        }

        console.log('Moving to item', chosenItemName);
        this.moveThroughDoors(virtualPlayerCoord.position, chosenItemPath, gameInstance.game.map);

        console.log('ItemReplace?:', willReplaceItem);
        console.log('Lowest priority item:', lowestPriorityItem);
        if (willReplaceItem) {
            this.replaceItem(lowestPriorityItem, chosenItemName);
        }
        return true;
    }

    moveToPlayers() {
        const gameInstance = this.activeGames.activeGames.find((instance) => instance.roomId === this.roomId);
        if (!gameInstance) {
            return;
        }
        const virtualPlayerCoord = gameInstance.playersCoord.find((playerCoord) => playerCoord.player.id === this.virtualPlayerId);

        const gameStructureOpenedDoors = this.openAllDoors(gameInstance.game);
        const pathsToPlayers = this.findPathsToPlayers(gameStructureOpenedDoors, virtualPlayerCoord.position, gameInstance.currentPlayerMoveBudget);

        const validPaths = pathsToPlayers.filter((path) => path.length !== 0);
        if (validPaths.length === 0) {
            console.log('No valid paths to players found');
            return false;
        }

        validPaths.sort((a, b) => a.length - b.length);
        const chosenPlayerPath = validPaths[0];

        console.log('Moving to player');
        this.moveThroughDoors(virtualPlayerCoord.position, chosenPlayerPath, gameInstance.game.map);
        return true;
    }

    findPathsToPlayers(gameStructure: GameStructure, startPosition: number, budget: number): any[] {
        let pathsToPlayers = [];
        gameStructure.map.forEach((tile) => {
            if (tile.hasPlayer && tile.idx !== startPosition) {
                console.log(tile);
                console.log(startPosition);
                console.log(budget);
                const player = this.movementService.shortestPath(budget, gameStructure, startPosition, tile.idx);
                console.log('Player:', player);
                pathsToPlayers.push(player.path);
            }
        });
        return pathsToPlayers;
    }

    findPathsToItems(gameStructure: GameStructure, startPosition: number, budget: number): any[] {
        let pathsToItems = [];
        console.log('Finding paths to items');
        gameStructure.map.forEach((tile) => {
            if (tile.item != '' && tile.item != 'startingPoint') {
                const item = this.movementService.shortestPath(budget, gameStructure, startPosition, tile.idx);
                console.log('Item:', item);
                pathsToItems.push([item.path, tile.item]);
            }
        });
        return pathsToItems;
    }

    // this is necessary since the shortest path function does not take into account closed doors
    openAllDoors(game: GameStructure): GameStructure {
        let gameStructureOpenedDoors = JSON.parse(JSON.stringify(game)) as GameStructure;
        gameStructureOpenedDoors.map.forEach((tile) => {
            if (tile.tileType === 'doorClosed') {
                tile.tileType = 'doorOpen';
            }
        });
        return gameStructureOpenedDoors;
    }

    findLowestPriorityItem(inventory: string[], itemPriorities: string[]): string {
        let lowestPriorityItem = inventory[0];
        for (let i = 1; i < inventory.length; i++) {
            if (itemPriorities.indexOf(inventory[i]) > itemPriorities.indexOf(lowestPriorityItem)) {
                lowestPriorityItem = inventory[i];
            }
        }
        return lowestPriorityItem;
    }

    moveThroughDoors(startPosition: number, path: number[], map: any[]): void {
        const doorIndexes = map.filter((tile) => tile.tileType === 'doorClosed').map((tile) => tile.idx);
        const doorsToOpen = [];

        let lastIndexBeforeDoor = startPosition;
        for (const index of path) {
            if (doorIndexes.includes(index)) {
                doorsToOpen.push([lastIndexBeforeDoor, index]);
            } else {
                lastIndexBeforeDoor = index;
            }
        }

        doorsToOpen.forEach((doorCoords) => {
            this.moveToDoor(doorCoords[0]); // move to tile before door
            this.interactWithDoor(doorCoords[1]); // open door
        });
        // move to item after all doors are opened
        this.actionHandler.handleMove({ roomId: this.roomId, playerId: this.virtualPlayerId, endPosition: path[path.length - 1] }, this.server, null);
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
