import { GameJson, TileJson } from '@app/model/game-structure';
import { Injectable } from '@nestjs/common';

interface Coord {
    x: number;
    y: number;
    distance?: number;
    parentNodes?: Coord[];
}

enum TileType {
    Ice = 0,
    Floor = 1,
    DoorOpen = 1,
    Water = 2,
}

@Injectable()
export class MapStateHandlerService {
    constructor() {}
    activeGames: GameJson[] = [];
    turn: number = 0;
    game: GameJson;
    activeIndex: number = 0;

    // placeholder for now
    playermoveSpeed = 3;

    /**
     * Checks if the given coordinates are a valid position on the game map.
     *
     * @param Coord - The coordinates to check.
     * @returns `true` if the position is valid, `false` otherwise.
     *
     * The position is considered valid if:
     * - The coordinates are within the bounds of the map.
     * - The tile at the coordinates is not of type "wall", "water", "doorClosed", and does not have a player.
     * - The player's move speed is greater than or equal to the distance to the coordinates.
     */
    isValidPosition(Coord: Coord): boolean {
        const mapSize: number = Number(this.game.mapSize);
        const mapTile: TileJson = this.game.map[Coord.x * mapSize + Coord.y];

        let isValidPosition = true;

        //TODO: refactor this to be more readable
        //TODO: put valid tile types in an array and check if the tile type is in the array
        if (Coord.x < 0 || Coord.x >= mapSize || Coord.y < 0 || Coord.y >= mapSize) {
            return false;
        }
        if (mapTile.tileType === 'wall' || mapTile.tileType === 'doorClosed' || mapTile.hasPlayer) {
            return false;
        }
        if (this.playermoveSpeed < Coord.distance) {
            return false;
        }

        return isValidPosition;
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

    shortestpath(Coord: Coord, Coord2: Coord, game: GameJson): Coord[] {
        const map = game.map;
        const mapSize = Number(game.mapSize);

        const visited: boolean[][] = [];
        let destinationNode;
        // initialize visited array
        for (let i = 0; i < mapSize; i++) {
            visited.push([]);
            for (let j = 0; j < mapSize; j++) {
                visited[i].push(false);
            }
        }

        const queue: Coord[] = [];
        // push the starting position to the queue and mark it as visited (added a distance property to the object)
        queue.push({ x: Coord.x, y: Coord.y, distance: 0, parentNodes: [] });
        visited[Coord.x][Coord.y] = true;
        let found = false;

        while (queue.length > 0) {
            const current = queue.shift();
            if (current.x === Coord2.x && current.y === Coord2.y) {
                destinationNode = current;
                found = true;
                break;
            }

            // check if the tile is walkable
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    // skip the current position and diagonal movement
                    if ((i === 0 && j === 0) || (Math.abs(i) === 1 && Math.abs(j) === 1)) {
                        continue;
                    }

                    const x = current.x + i;
                    const y = current.y + j;
                    const tileMovementCost = this.tileValue(map[x * mapSize + y].tileType);
                    const totalDistance = current.distance + tileMovementCost;

                    if (!visited[x][y] && this.isValidPosition({ x: x, y: y, distance: totalDistance })) {
                        queue.push({
                            x: x,
                            y: y,
                            distance: totalDistance,
                            parentNodes: [...current.parentNodes, { x: current.x, y: current.y, distance: current.distance }],
                        });

                        visited[x][y] = true;
                    }
                }
            }
            queue.sort((a, b) => a.distance - b.distance);
        }

        return found ? [{ x: Coord.x, y: Coord.y }, ...destinationNode.parentNodes, { x: Coord2.x, y: Coord2.y }] : [];
    }

    /**
     * Calculates the available moves from a given coordinate on the game map.
     *
     * @param {Coord} Coord - The starting coordinate.
     * @returns {Coord[]} An array of coordinates representing the available moves.
     *
     * The function uses a breadth-first search algorithm to explore all possible moves
     * from the starting coordinate. It ensures that each position is visited only once
     * and checks if the position is valid and walkable before adding it to the list of
     * available moves.
     */
    availableMoves(Coord: Coord): Coord[] {
        const map = this.game.map;
        const mapSize = Number(this.game.mapSize);
        let coordPath: Coord[] = [];
        const visited: boolean[][] = [];

        // initialize visited array
        for (let i = 0; i < mapSize; i++) {
            visited.push([]);
            for (let j = 0; j < mapSize; j++) {
                visited[i].push(false);
            }
        }

        const queue: Coord[] = [];
        // push the starting position to the queue and mark it as visited (added a distance property to the object)
        queue.push({ x: Coord.x, y: Coord.y, distance: 0 });
        visited[Coord.x][Coord.y] = true;

        while (queue.length > 0) {
            const current = queue.shift();

            // check if the tile is walkable
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    // skip the current position and diagonal movement
                    if ((i === 0 && j === 0) || (Math.abs(i) === 1 && Math.abs(j) === 1)) {
                        continue;
                    }

                    const x = current.x + i;
                    const y = current.y + j;
                    const tileMovementCost = this.tileValue(map[x * mapSize + y].tileType);

                    if (!visited[x][y] && this.isValidPosition({ x: x, y: y, distance: current.distance + tileMovementCost })) {
                        queue.push({ x: x, y: y, distance: current.distance + tileMovementCost });
                        coordPath.push({ x: x, y: y });
                        visited[x][y] = true;
                    }
                }
            }
            queue.sort((a, b) => a.distance - b.distance);
        }
        return coordPath;
    }
}
