import { GameDto } from '@app/model/dto/game/game.dto';
import { TileDto } from '@app/model/dto/game/tile.dto';
import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ async: true })
@Injectable()
export class AllTilesAccessibleValidator implements ValidatorConstraintInterface {
    async validate(map: TileDto[], args: ValidationArguments): Promise<boolean> {
        const object = args.object as GameDto;
        const mapSize = parseInt(object.mapSize, 10);

        const grid = this.createGrid(map, mapSize);
        const groundDoorTiles = this.extractGroundDoorTiles(grid, mapSize);

        // redundant check to see if we have no ground tiles (shouldn't happen anyway since we need more than 50% of ground tiles)
        if (groundDoorTiles.length === 0) {
            return true;
        }

        return this.areAllGroundTilesAccessible(grid, groundDoorTiles, mapSize);
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

    extractGroundDoorTiles(grid: TileDto[][], mapSize: number): [number, number][] {
        const groundDoorTiles: [number, number][] = [];
        for (let i = 0; i < mapSize; i++) {
            for (let j = 0; j < mapSize; j++) {
                if (grid[i][j].tileType === '' || grid[i][j].tileType === 'door') {
                    groundDoorTiles.push([i, j]);
                }
            }
        }
        return groundDoorTiles;
    }

    areAllGroundTilesAccessible(grid: TileDto[][], groundDoorTiles: [number, number][], mapSize: number): boolean {
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

    defaultMessage() {
        return 'Toutes les tuiles de terrain doivent être accessibles';
    }
}
