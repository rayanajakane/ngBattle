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
    shouldEndTurn: boolean;

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
        this.shouldEndTurn = true;
        const virtualPlayerCoord = gameInstance.playersCoord.find((playerCoord) => playerCoord.player.id === this.virtualPlayerId);
        const virtualPlayerPosition = virtualPlayerCoord.position;

        await this.waitRandomTime();

        if (this.isDefensive()) {
            this.defensiveThink(virtualPlayerPosition);
        } else {
            this.aggressiveThink(virtualPlayerPosition);
        }

        if (this.activeGames.getActiveGame(this.roomId) && this.shouldEndTurn) {
            this.actionHandler.handleEndTurn({ roomId: this.roomId, playerId: this.virtualPlayerId, lastTurn: false }, this.server);
        }
    }

    defensiveThink(position: number) {
        if (!this.activeGames.getActiveGame(this.roomId)) return;

        if (Math.random() < 0.1) {
            this.move();
            return;
        }
        if (!this.moveToItems()) {
            const nearbyPlayers = this.actionButtonService.getPlayersAround(this.roomId, position);
            if (nearbyPlayers.length > 0) {
                console.log('Found players nearby before movging:', nearbyPlayers);
                const randomPlayerCoord = nearbyPlayers[Math.floor(Math.random() * nearbyPlayers.length)];
                if (this.canDoAction(this.virtualPlayerId)) {
                    this.startAttack(randomPlayerCoord);
                }
                return;
            }
            if (this.moveToPlayers()) {
                const gameInstance = this.activeGames.activeGames.find((instance) => instance.roomId === this.roomId);
                const virtualPlayerCoord = gameInstance.playersCoord.find((playerCoord) => playerCoord.player.id === this.virtualPlayerId);
                const newVirtualPlayerPosition = virtualPlayerCoord.position;
                const nearbyPlayers = this.actionButtonService.getPlayersAround(this.roomId, newVirtualPlayerPosition);
                console.log('Nearby players:', nearbyPlayers);
                const randomPlayerCoord = nearbyPlayers[Math.floor(Math.random() * nearbyPlayers.length)];
                if (this.canDoAction(this.virtualPlayerId)) {
                    this.startAttack(randomPlayerCoord);
                }
            } else {
                this.move();
                return;
            }
        }
    }

    aggressiveThink(position: number) {
        if (!this.activeGames.getActiveGame(this.roomId)) return;

        if (Math.random() < 0.1) {
            this.move();
            return;
        }
        // check if there are players nearby without having to move
        const nearbyPlayers = this.actionButtonService.getPlayersAround(this.roomId, position);
        if (nearbyPlayers.length > 0 && this.canDoAction(this.virtualPlayerId)) {
            console.log('Found players nearby before movging:', nearbyPlayers);
            const randomPlayerCoord = nearbyPlayers[Math.floor(Math.random() * nearbyPlayers.length)];
            this.startAttack(randomPlayerCoord);
            return;
        } else if (!this.moveToPlayers()) {
            if (!this.moveToItems()) this.move();
        } else {
            console.log('Moved to players');
            const gameInstance = this.activeGames.activeGames.find((instance) => instance.roomId === this.roomId);
            const virtualPlayerCoord = gameInstance.playersCoord.find((playerCoord) => playerCoord.player.id === this.virtualPlayerId);
            const newVirtualPlayerPosition = virtualPlayerCoord.position;
            const nearbyPlayers = this.actionButtonService.getPlayersAround(this.roomId, newVirtualPlayerPosition);
            console.log('Nearby players:', nearbyPlayers);
            if (nearbyPlayers.length === 0) return;
            const randomPlayerCoord = nearbyPlayers[Math.floor(Math.random() * nearbyPlayers.length)];
            if (this.canDoAction(this.virtualPlayerId)) {
                this.startAttack(randomPlayerCoord);
            }
        }
    }

    // decides if VP attacks or escapes
    async fight(attacked: boolean) {
        const gameInstance = this.activeGames.activeGames.find((instance) => instance.roomId === this.roomId);
        if (!gameInstance) {
            return;
        }
        await this.waitRandomTime();
        if (this.isDefensive() && attacked) {
            this.combatHandlerService.handleCombatEscape(this.roomId, this.virtualPlayerId, this.server);
        } else {
            this.combatHandlerService.handleCombatAttack(this.roomId, this.virtualPlayerId, this.server);
        }
    }

    waitRandomTime() {
        const waitTime = Math.floor(Math.random() * 2000) + 1000;
        return new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    isDefensive() {
        const gameInstance = this.activeGames.activeGames.find((instance) => instance.roomId === this.roomId);
        if (!gameInstance) {
            return;
        }
        const virtualPlayerCoord = gameInstance.playersCoord.find((playerCoord) => playerCoord.player.id === this.virtualPlayerId);
        const profile = virtualPlayerCoord.player.virtualProfile;
        return profile === 'defensive';
    }

    move() {
        if (!this.activeGames.getActiveGame(this.roomId)) return;
        const availablePlayerMoves = this.actionService.availablePlayerMoves(this.virtualPlayerId, this.roomId);
        // verify if there are available moves left, end turn not via `handleEndTurn`
        let endPosition: number;
        const accessibleTiles = Object.keys(availablePlayerMoves).map(Number);
        endPosition = accessibleTiles[Math.floor(Math.random() * accessibleTiles.length)];
        this.actionHandler.handleMove({ roomId: this.roomId, playerId: this.virtualPlayerId, endPosition }, this.server, null);
    }

    startAttack(targetPlayerCoord: PlayerCoord) {
        if (!this.activeGames.getActiveGame(this.roomId)) return;
        this.shouldEndTurn = false;
        if (this.canDoAction(this.virtualPlayerId)) {
            this.combatHandlerService.handleAction(this.roomId, this.virtualPlayerId, targetPlayerCoord.position, null, this.server);
            this.combatHandlerService.handleCombatAttack(this.roomId, this.virtualPlayerId, this.server);
            this.useActionNumber(this.virtualPlayerId);
        } else {
            this.move();
        }
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
        const chosenItemPath = chosenItem[0];
        const chosenItemName = chosenItem[1];

        let lowestPriorityItem;
        let willReplaceItem = false;
        const inventory = virtualPlayerCoord.player.inventory;
        if (this.inventoryService.isInventoryFull(inventory)) {
            lowestPriorityItem = this.findLowestPriorityItem(inventory, itemPriorities);
            if (itemPriorities.indexOf(chosenItemName) < itemPriorities.indexOf(lowestPriorityItem)) {
                willReplaceItem = true;
            } else {
                return false;
            }
        }

        this.moveThroughDoors(virtualPlayerCoord.position, chosenItemPath, gameInstance.game.map);

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

        this.moveThroughDoors(virtualPlayerCoord.position, chosenPlayerPath, gameInstance.game.map);
        return true;
    }

    findPathsToPlayers(gameStructure: GameStructure, startPosition: number, budget: number): any[] {
        if (!this.activeGames.getActiveGame(this.roomId)) return;

        let pathsToPlayers = [];
        const adjacentTiles = this.getAdjacentTiles(startPosition);

        gameStructure.map.forEach((tile) => {
            if (
                tile.tileType !== 'wall' &&
                tile.idx !== startPosition &&
                !adjacentTiles.includes(tile.idx) &&
                this.actionButtonService.getPlayersAround(this.roomId, tile.idx).length > 0
            ) {
                const player = this.movementService.shortestPath(budget, gameStructure, startPosition, tile.idx);
                pathsToPlayers.push(player.path);
            }
        });
        console.log('Paths to players:', pathsToPlayers);
        return pathsToPlayers;
    }

    getAdjacentTiles(position: number) {
        const gameInstance = this.activeGames.activeGames.find((instance) => instance.roomId === this.roomId);
        if (!gameInstance) {
            return;
        }
        const mapSize = parseInt(gameInstance.game.mapSize, 10);
        const mapLength = gameInstance.game.map.length;

        const isRightValid = position % mapSize !== mapSize - 1;
        const isLeftValid = position % mapSize !== 0;
        const isUpValid = position - mapSize >= 0;
        const isDownValid = position + mapSize < mapLength;

        const adjacentTiles = [];

        isRightValid ? adjacentTiles.push(position + 1) : null;
        isLeftValid ? adjacentTiles.push(position - 1) : null;
        isUpValid ? adjacentTiles.push(position - mapSize) : null;
        isDownValid ? adjacentTiles.push(position + mapSize) : null;

        return adjacentTiles;
    }

    findPathsToItems(gameStructure: GameStructure, startPosition: number, budget: number): any[] {
        if (!this.activeGames.getActiveGame(this.roomId)) return;
        let pathsToItems = [];
        gameStructure.map.forEach((tile) => {
            if (tile.item != '' && tile.item != 'startingPoint') {
                const item = this.movementService.shortestPath(budget, gameStructure, startPosition, tile.idx);
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
        if (!this.activeGames.getActiveGame(this.roomId)) return;
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
            if (!this.canDoAction(this.virtualPlayerId)) return;
            this.interactWithDoor(doorCoords[1]); // open door
        });
        // move to item after all doors are opened
        this.actionHandler.handleMove({ roomId: this.roomId, playerId: this.virtualPlayerId, endPosition: path[path.length - 1] }, this.server, null);
    }

    replaceItem(droppedItem, collectedItem: ItemTypes) {
        if (!this.activeGames.getActiveGame(this.roomId)) return;
        const gameInstance = this.activeGames.activeGames.find((instance) => instance.roomId === this.roomId);
        if (!gameInstance) {
            return;
        }
        const virtualPlayerCoord = gameInstance.playersCoord.find((playerCoord) => playerCoord.player.id === this.virtualPlayerId);
        const allItems = [...virtualPlayerCoord.player.inventory, collectedItem];
        this.inventoryService.updateInventory(this.server, null, this.virtualPlayerId, allItems, droppedItem, this.roomId);
    }

    moveToDoor(tileBeforeDoor: number) {
        this.actionHandler.handleMove({ roomId: this.roomId, playerId: this.virtualPlayerId, endPosition: tileBeforeDoor }, this.server, null);
    }

    interactWithDoor(doorPosition: number) {
        this.combatHandlerService.handleAction(this.roomId, this.virtualPlayerId, doorPosition, null, this.server);
        this.useActionNumber(this.virtualPlayerId);
    }

    canDoAction(playerId: string): boolean {
        const virtualPlayer = this.activeGames.activeGames
            .find((instance) => instance.roomId === this.roomId)
            .playersCoord.find((playerCoord) => playerCoord.player.id === playerId);
        if (virtualPlayer.player.actionNumber > 0) {
            return true;
        } else {
            return false;
        }
    }

    useActionNumber(playerId: string): void {
        const gameInstance = this.activeGames.activeGames.find((instance) => instance.roomId === this.roomId);
        if (!gameInstance) {
            return;
        }
        const virtualPlayerCoord = gameInstance.playersCoord.find((playerCoord) => playerCoord.player.id === playerId);
        virtualPlayerCoord.player.actionNumber = 0;
    }
}
