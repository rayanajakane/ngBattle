import { Action } from '@common/actions-button';
import { TileStructure } from '@common/game-structure';
import { PlayerCoord } from '@common/player';
import { TileTypes } from '@common/tile-types';
import { Inject, Injectable } from '@nestjs/common';
import { ActionService } from '../action/action.service';
import { ActiveGamesService } from '../active-games/active-games.service';
import { CombatService } from '../combat/combat.service';
@Injectable()
export class ActionButtonService {
    constructor(
        @Inject(ActiveGamesService) private readonly activeGamesService: ActiveGamesService,
        @Inject(ActionService) private readonly actionService: ActionService,
        @Inject(CombatService) private readonly combatService: CombatService,
    ) {}

    private fighters: PlayerCoord[] = [];

    // TODO : Add the logic for the action buttons ( inside the map-game service)
    // returns all the players that are around
    getPlayersAround(roomId: string, position: number): PlayerCoord[] {
        const gameInstance = this.activeGamesService.getActiveGame(roomId);
        const mapSize = parseInt(gameInstance.game.mapSize);
        const right = gameInstance.game.map[position + 1].hasPlayer;
        const left = gameInstance.game.map[position - 1].hasPlayer;
        const up = gameInstance.game.map[position - mapSize].hasPlayer;
        const down = gameInstance.game.map[position + mapSize].hasPlayer;
        const players: PlayerCoord[] = [];
        if (right) {
            // find the Player
            const player: PlayerCoord = gameInstance.playersCoord.find((playerCoord) => playerCoord.position === position + 1);
            // only push when not undefined
            if (player) players.push(player);
        }
        if (left) {
            const player: PlayerCoord = gameInstance.playersCoord.find((playerCoord) => playerCoord.position === position - 1);
            if (player) players.push(player);
        }
        if (up) {
            const player: PlayerCoord = gameInstance.playersCoord.find((playerCoord) => playerCoord.position === position - mapSize);
            if (player) players.push(player);
        }
        if (down) {
            const player: PlayerCoord = gameInstance.playersCoord.find((playerCoord) => playerCoord.position === position + mapSize);
            if (player) players.push(player);
        }
        return players;
    }
    // check if there are any doors around active player
    getDoorsAround(roomId: string, player: PlayerCoord): TileStructure[] {
        const doorsFound: TileStructure[] = [];
        const gameInstance = this.activeGamesService.getActiveGame(roomId);
        const mapSize = parseInt(gameInstance.game.mapSize);
        const doors: TileTypes[] = [TileTypes.DOOR, TileTypes.DOORCLOSED, TileTypes.DOOROPEN];
        if (doors.includes(gameInstance.game.map[player.position + 1].tileType as TileTypes)) {
            doorsFound.push(gameInstance.game.map[player.position + 1]);
        }
        if (doors.includes(gameInstance.game.map[player.position - 1].tileType as TileTypes)) {
            doorsFound.push(gameInstance.game.map[player.position - 1]);
        }
        if (doors.includes(gameInstance.game.map[player.position - mapSize].tileType as TileTypes)) {
            doorsFound.push(gameInstance.game.map[player.position - mapSize]);
        }
        if (doors.includes(gameInstance.game.map[player.position + mapSize].tileType as TileTypes)) {
            doorsFound.push(gameInstance.game.map[player.position + mapSize]);
        }
        return doorsFound;
    }

    // choose to open door or start combat
    chosenAction(roomId: string, originalPlayer: PlayerCoord, action: Action, targetPlayer?: PlayerCoord): void {
        if (action === Action.DOOR) {
            // call the action service to open the door
            this.actionService.interactWithDoor(roomId, originalPlayer.player.id, originalPlayer.position);
        } else if (action === Action.FIGHT) {
            // add the players to the combat
            this.setFightParticipants(roomId, originalPlayer, targetPlayer);
            this.startCombat(roomId, this.fighters);
        }
    }

    // set fight participants in a combat
    setFightParticipants(roomId: string, originalPlayer: PlayerCoord, targetPlayer: PlayerCoord): void {
        if (this.fighters.length != 0) {
            this.fighters = [];
        }
        this.fighters.push(originalPlayer); // idx 0
        this.fighters.push(targetPlayer); // idx 1
    }

    // start combat
    startCombat(roomId: string, fighters: PlayerCoord[]): void {
        // call the combat service to start the combat
        this.combatService.startCombat(roomId, fighters);
    }
}
