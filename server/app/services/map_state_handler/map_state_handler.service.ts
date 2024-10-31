import { GameJson, TileJson } from '@app/model/game-structure';
import { Injectable } from '@nestjs/common';


interface Coord{
    x: number;
    y: number;
    distance?: number;
}

@Injectable()
export class MapStateHandlerService {
    constructor() {
    }
    activeGames: GameJson[] = [];
    turn: number = 0;
    game: GameJson;

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
    isValidPosition(Coord: Coord): boolean{
        const mapSize: number = Number(this.game.mapSize);
        const mapTile: TileJson = this.game.map[Coord.x * mapSize + Coord.y];

        let isValidPosition = true;

        //TODO: refactor this to be more readable
        //TODO: put valid tile types in an array and check if the tile type is in the array
        if (Coord.x < 0 || Coord.x >= mapSize || Coord.y < 0 || Coord.y >= mapSize){
            return false;
        }
        if(mapTile.tileType === "wall" || mapTile.tileType === "water" || mapTile.tileType === "doorClosed" || mapTile.hasPlayer){
            return false;
        }
        if(this.playermoveSpeed < Coord.distance){
            return false;
        }

        return isValidPosition;
    }
        

    shortestpath(Coord: Coord, Coord2: Coord, game: GameJson): Coord[] {
        const map = game.map;
        const mapSize = Number(game.mapSize);
        let coordPath: Coord[] = [];
        const visited: boolean[][] = [];

        // initialize visited array
        for (let i = 0; i < mapSize; i++){
            visited.push([]);
            for (let j = 0; j < mapSize; j++){
                visited[i].push(false);
            }
        }

        const queue : Coord[] = [];
        // push the starting position to the queue and mark it as visited (added a distance property to the object)
        queue.push({x: Coord.x, y: Coord.y, distance: 0});
        visited[Coord.x][Coord.y] = true;
        let found = false;

        while(queue.length > 0){
            const current = queue.shift();
            if (current.x === Coord2.x && current.y === Coord2.y){
                found = true;
                break;
            }

            // check if the tile is walkable
            for(let i = -1; i <= 1; i++){
                for(let j = -1; j <= 1; j++){
                    if (i === 0 && j === 0){
                        continue;
                    }
                    const x = current.x + i;
                    const y = current.y + j;
                    if(!visited[x][y] && this.isValidPosition({x: x, y: y, distance: current.distance + 1})){
                        queue.push({x: x, y: y, distance: current.distance + 1});
                        visited[x][y] = true;
                    }
                    
                }
            }
            queue.sort((a, b) => a.distance - b.distance);
            
        }



    }

}
