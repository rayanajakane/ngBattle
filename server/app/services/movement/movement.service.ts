import { GameJson, TileJson } from '@app/model/game-structure';
import { Injectable } from '@nestjs/common';
//TODO: take a look at the Coord interface and see if it can be moved to a separate file
import { Coord } from '../map_state_handler/map_state_handler.service';

//TODO: replace then tile types with enums
//TODO: test functions in this service
@Injectable()
export class MovementService {
    // placeholder for now
    playermoveSpeed: number = 3;
    private invalidTileTypes: string[] = ['wall', 'doorClosed'];

    isValidPosition(coord: Coord, game: GameJson): boolean {
        const mapSize: number = Number(game.mapSize);
        const mapTile: TileJson = game.map[coord.x * mapSize + coord.y];

        // Check if coordinates are within bounds
        if (coord.x < 0 || coord.x >= mapSize || coord.y < 0 || coord.y >= mapSize) {
            return false;
        }

        // Check if the tile type is invalid or if the tile has a player
        if (this.invalidTileTypes.includes(mapTile.tileType) || mapTile.hasPlayer) {
            return false;
        }

        // Check if the player's move speed is sufficient
        if (this.playermoveSpeed < coord.distance) {
            return false;
        }

        return true;
    }

    //TODO: replace this function with enums in the datastructure of the tile
    tileValue(type: string): number {
        switch (type) {
            case 'ice':
                return 0;
            case 'floor':
                return 1;
            case 'doorOpen':
                return 1;
            case 'water':
                return 2;
            default:
                return 1;
        }
    }

    shortestPath(startCoord: Coord, endCoord: Coord, game: GameJson): number[] {
        const map = game.map;
        const mapSize = Number(game.mapSize);
        const visited: boolean[][] = Array.from({ length: mapSize }, () => Array(mapSize).fill(false));
        const queue: Coord[] = [{ ...startCoord, distance: 0, parentNodes: [] }];
        let destinationNode: Coord | undefined;
        let found = false;

        visited[startCoord.x][startCoord.y] = true;

        while (queue.length > 0) {
            const current = queue.shift();

            if (current.x === endCoord.x && current.y === endCoord.y) {
                destinationNode = current;
                found = true;
                break;
            }

            for (const [dx, dy] of [
                [0, 1],
                [1, 0],
                [0, -1],
                [-1, 0],
            ]) {
                const x = current.x + dx;
                const y = current.y + dy;
                //TODO: replace the tileValue function with enums of tile types holding the values
                const totalDistance = current.distance + this.tileValue(map[x * mapSize + y].tileType);

                if (!visited[x][y] && this.isValidPosition({ x, y, distance: totalDistance }, game)) {
                    queue.push({
                        x,
                        y,
                        distance: totalDistance,
                        parentNodes: [...current.parentNodes, { x: current.x, y: current.y, distance: current.distance }],
                    });
                    visited[x][y] = true;
                }
            }

            queue.sort((a, b) => a.distance - b.distance);
        }

        return found
            ? [
                  startCoord.x * mapSize + startCoord.y,
                  ...destinationNode.parentNodes.map((coord) => coord.x * mapSize + coord.y),
                  endCoord.x * mapSize + endCoord.y,
              ]
            : [];
    }

    availableMoves(startCoord: Coord, game: GameJson): number[] {
        const map = game.map;
        const mapSize = Number(game.mapSize);
        const coordPath: Coord[] = [];
        const visited: boolean[][] = Array.from({ length: mapSize }, () => Array(mapSize).fill(false));
        const queue: Coord[] = [{ ...startCoord, distance: 0 }];

        visited[startCoord.x][startCoord.y] = true;

        while (queue.length > 0) {
            const current = queue.shift();

            for (const [dx, dy] of [
                [0, 1],
                [1, 0],
                [0, -1],
                [-1, 0],
            ]) {
                const x = current.x + dx;
                const y = current.y + dy;

                const totalDistance = current.distance + this.tileValue(map[x * mapSize + y].tileType);

                if (!visited[x][y] && this.isValidPosition({ x, y, distance: totalDistance }, game)) {
                    queue.push({ x, y, distance: totalDistance });
                    coordPath.push({ x, y });
                    visited[x][y] = true;
                }
            }

            queue.sort((a, b) => a.distance - b.distance);
        }

        return coordPath.map((coord) => coord.x * mapSize + coord.y);
    }
}
