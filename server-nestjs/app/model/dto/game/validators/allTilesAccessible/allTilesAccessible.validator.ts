import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { GameDto } from '../../game.dto';
import { TileDto } from '../../tile.dto';

@ValidatorConstraint({ async: true })
@Injectable()
export class AllTilesAccessibleValidator implements ValidatorConstraintInterface {
    async validate(map: TileDto[], args: ValidationArguments): Promise<boolean> {
        const object = args.object as GameDto;
        const mapSize = parseInt(object.mapSize);

        const grid = this.createGrid(map, mapSize);
        const groundTiles = this.extractGroundTiles(grid, mapSize);

        // redundant check to see if we have no ground tiles (shouldn't happen anyway since we need more than 50% of ground tiles)
        if (groundTiles.length === 0) {
            return true;
        }

        return this.areAllGroundTilesAccessible(grid, groundTiles, mapSize);
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

    extractGroundTiles(grid: TileDto[][], mapSize: number): [number, number][] {
        const groundTiles: [number, number][] = [];
        for (let i = 0; i < mapSize; i++) {
            for (let j = 0; j < mapSize; j++) {
                if (grid[i][j].tileType === '') {
                    groundTiles.push([i, j]);
                }
            }
        }
        return groundTiles;
    }

    areAllGroundTilesAccessible(grid: TileDto[][], groundTiles: [number, number][], mapSize: number): boolean {
        const directions = [
            [0, 1],
            [1, 0],
            [0, -1],
            [-1, 0],
        ];
        const visited = new Set<string>();
        const queue: [number, number][] = [groundTiles[0]];
        visited.add(groundTiles[0].toString());

        while (queue.length > 0) {
            const [x, y] = queue.shift()!;
            for (const [dx, dy] of directions) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && ny >= 0 && nx < mapSize && ny < mapSize && !visited.has([nx, ny].toString()) && grid[nx][ny].tileType === '') {
                    queue.push([nx, ny]);
                    visited.add([nx, ny].toString());
                }
            }
        }

        for (const [x, y] of groundTiles) {
            if (!visited.has([x, y].toString())) {
                return false;
            }
        }

        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return 'Toutes les tuiles de terrain doivent être accessibles';
    }
}
