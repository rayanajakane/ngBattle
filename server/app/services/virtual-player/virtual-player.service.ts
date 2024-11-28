import { ActionHandlerService } from '@app/services/action-handler/action-handler.service';
import { ActionService } from '@app/services/action/action.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { GameStructure } from '@common/game-structure';
import { PlayerCoord } from '@common/player';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { ActionButtonService } from '../action-button/action-button.service';
import { CombatHandlerService } from '../combat-handler/combat-handler.service';
import { MovementService } from '../movement/movement.service';

@Injectable()
export class VirtualPlayerService {
    virtualPlayerId: string;
    roomId: string;
    server: Server;

    constructor(
        @Inject(forwardRef(() => ActionHandlerService)) private readonly actionHandler: ActionHandlerService,
        @Inject(forwardRef(() => CombatHandlerService)) private readonly combatHandlerService: CombatHandlerService,
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
                console.log('Found item');
                const budget = gameInstance.currentPlayerMoveBudget;
                const item = this.movementService.shortestPath(budget, gameStructureOpenedDoors, virtualPlayerCoord.position, tile.idx);
                console.log('item', item);
                pathsToItems.push([item.path, tile.item]);
            }
        });

        if (pathsToItems.length === 0) {
            console.log('No items found');
            this.move();
        }

        // find the right item
        const chosenItemPath = pathsToItems[0][0];
        console.log('Chosen item path', chosenItemPath);

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
            setTimeout(() => {
                this.interactWithDoor(doorCoords[1]);
            }, 1000);
            this.actionHandler.handleEndTurn({ roomId: this.roomId, playerId: this.virtualPlayerId, lastTurn: false }, this.server);
        });
    }

    moveToDoor(tileBeforeDoor: number) {
        console.log('Moving to door', tileBeforeDoor);
        this.actionHandler.handleMove({ roomId: this.roomId, playerId: this.virtualPlayerId, endPosition: tileBeforeDoor }, this.server, null);
    }

    interactWithDoor(doorPosition: number) {
        this.combatHandlerService.handleAction(this.roomId, this.virtualPlayerId, doorPosition, null, this.server);
    }
}
