import { TileDto } from '@app/model/dto/game/tile.dto';
import { Game } from '@app/model/schema/game.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ValidationService {
    constructor(@InjectModel(Game.name) private gameModel: Model<Game>) {}

    async isUniqueName(name: string): Promise<boolean> {
        const filteredGamesByName: Game[] = await this.gameModel.find({ gameName: name }).exec();
        return filteredGamesByName.length === 0;
    }

    async validateId(id: string): Promise<boolean> {
        const filteredGamesById: Game[] = await this.gameModel.find({ id }).exec();
        return filteredGamesById.length === 0;
    }

    hasStartingPoints(map: TileDto[], mapSize: number) {
        const startingPoints = map.filter((tile) => tile.item === 'startingPoint').length;

        if (mapSize <= 10) {
            return startingPoints >= 2;
        } else if (mapSize <= 15) {
            return startingPoints >= 4;
        } else if (mapSize <= 20) {
            return startingPoints >= 6;
        }

        return false;
    }

    hasCorrectGroundAmount(map: TileDto[]) {
        const totalTiles = map.length;
        const emptyTiles = map.filter((tile) => tile.tileType === '').length;
        const threshold = 0.5;
        return emptyTiles / totalTiles > threshold;
    }

    areAllTilesAccessible(map: TileDto[], mapSize: number) {
        const grid = this.createGrid(map, mapSize);
        const groundDoorTiles = this.extractTiles(grid, mapSize, ['', 'door']);

        // redundant check to see if we have no ground tiles (shouldn't happen anyway since we need more than 50% of ground tiles)
        if (groundDoorTiles.length === 0) {
            return true;
        }

        return this.allGroundTilesAccessible(grid, groundDoorTiles, mapSize);
    }

    areAllDoorsValid(map: TileDto[], mapSize: number) {
        const grid = this.createGrid(map, mapSize);
        const doorTiles = this.extractTiles(grid, mapSize, ['door']);

        return this.allDoorsValid(grid, doorTiles, mapSize);
    }

    createGrid(map: TileDto[], mapSize: number): TileDto[][] {
        const grid: TileDto[][] = [];
        for (let i = 0; i < map.length; i++) {
            const row = Math.floor(i / mapSize);
            const col = i % mapSize;
            if (!grid[row]) {
                grid[row] = [];
            }
            grid[row][col] = map[i];
        }
        return grid;
    }

    extractTiles(grid: TileDto[][], mapSize: number, tileTypes: string[]): [number, number][] {
        const tiles: [number, number][] = [];
        for (let i = 0; i < mapSize; i++) {
            for (let j = 0; j < mapSize; j++) {
                if (tileTypes.includes(grid[i][j].tileType)) {
                    tiles.push([i, j]);
                }
            }
        }
        return tiles;
    }

    isHorizontalDoor(grid: TileDto[][], i: number, j: number, mapSize: number): boolean {
        return i > 0 && i < mapSize - 1 && grid[i - 1][j].tileType === 'wall' && grid[i + 1][j].tileType === 'wall';
    }

    isInvalidHorizontalDoor(grid: TileDto[][], i: number, j: number, mapSize: number): boolean {
        return (
            this.isHorizontalDoor(grid, i, j, mapSize) &&
            !(j > 0 && j < mapSize - 1 && grid[i][j - 1].tileType === '' && grid[i][j + 1].tileType === '')
        );
    }

    isVerticalDoor(grid: TileDto[][], i: number, j: number, mapSize: number): boolean {
        return j > 0 && j < mapSize - 1 && grid[i][j - 1].tileType === 'wall' && grid[i][j + 1].tileType === 'wall';
    }

    isInvalidVerticalDoor(grid: TileDto[][], i: number, j: number, mapSize: number): boolean {
        return (
            this.isVerticalDoor(grid, i, j, mapSize) &&
            !(i > 0 && i < mapSize - 1 && grid[i - 1][j].tileType === '' && grid[i + 1][j].tileType === '')
        );
    }

    allDoorsValid(grid: TileDto[][], doorTiles: [number, number][], mapSize: number): boolean {
        for (const [i, j] of doorTiles) {
            const isHorizontal = this.isHorizontalDoor(grid, i, j, mapSize);
            const isVertical = this.isVerticalDoor(grid, i, j, mapSize);
            const isInvalidHorizontal = this.isInvalidHorizontalDoor(grid, i, j, mapSize);
            const isInvalidVertical = this.isInvalidVerticalDoor(grid, i, j, mapSize);

            if (isInvalidHorizontal || isInvalidVertical || (!isHorizontal && !isVertical)) {
                return false;
            }
        }
        return true;
    }

    allGroundTilesAccessible(grid: TileDto[][], groundDoorTiles: [number, number][], mapSize: number): boolean {
        const directions = [
            [0, 1],
            [1, 0],
            [0, -1],
            [-1, 0],
        ];
        const visited = new Set<string>();
        const queue: [number, number][] = [groundDoorTiles[0]];
        visited.add(groundDoorTiles[0].toString());

        while (queue.length > 0) {
            const [x, y] = queue.shift();
            for (const [dx, dy] of directions) {
                const nx = x + dx;
                const ny = y + dy;
                if (
                    nx >= 0 &&
                    ny >= 0 &&
                    nx < mapSize &&
                    ny < mapSize && // check n is inside the grid
                    !visited.has([nx, ny].toString()) && // check n is not visited
                    (grid[nx][ny].tileType === '' || grid[nx][ny].tileType === 'door') // check n is a ground or door tile
                ) {
                    queue.push([nx, ny]);
                    visited.add([nx, ny].toString());
                }
            }
        }

        for (const [x, y] of groundDoorTiles) {
            if (!visited.has([x, y].toString())) {
                return false;
            }
        }

        return true;
    }
}
