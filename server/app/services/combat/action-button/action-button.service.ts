import { TileStructure } from '@common/game-structure';
import { Player, PlayerCoord } from '@common/player';
import { TileTypes } from '@common/tile-types';
import { Inject, Injectable } from '@nestjs/common';
import { ActionService } from '../../action/action.service';
import { ActiveGamesService } from '../../active-games/active-games.service';

@Injectable()
export class ActionButtonService {
    constructor(
        @Inject(ActiveGamesService) private readonly activeGamesService: ActiveGamesService,
        @Inject(ActionService) private readonly actionService: ActionService,
    ) {}
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
            players.push(player);
        }
        if (left) {
            const player: PlayerCoord = gameInstance.playersCoord.find((playerCoord) => playerCoord.position === position - 1);
            players.push(player);
        }
        if (up) {
            const player: PlayerCoord = gameInstance.playersCoord.find((playerCoord) => playerCoord.position === position - mapSize);
            players.push(player);
        }
        if (down) {
            const player: PlayerCoord = gameInstance.playersCoord.find((playerCoord) => playerCoord.position === position + mapSize);
            players.push(player);
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
    chosenAction(roomId: string, player: PlayerCoord, action: string): void {
        if (action === 'door') {
            // call the action service to open the door
            this.actionService.interactWithDoor(roomId, player.player.id, player.position);
        } else if (action === 'fight') {
            this.startCombat(roomId, this.activeGamesService.getActiveGame(roomId).fightParticipants);
        }
    }

    // set fight participants in a combat
    setFightParticipants(roomId: string, player: Player): void {}

    // start combat
    startCombat(roomId: string, fighters: Player[]): void {}

    // choose door to interact with
    chooseDoor(roomId: string, player: Player): void {}
}
