import { GameDto } from '@app/model/dto/game/game.dto';
import { TileDto } from '@app/model/dto/game/tile.dto';
import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ async: true })
@Injectable()
export class AllDoorsValidValidator implements ValidatorConstraintInterface {
    async validate(map: TileDto[], args: ValidationArguments): Promise<boolean> {
        const object = args.object as GameDto;
        const mapSize = parseInt(object.mapSize, 10);

        const grid = this.createGrid(map, mapSize);
        const doorTiles = this.extractDoorTiles(grid, mapSize);

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

    extractDoorTiles(grid: TileDto[][], mapSize: number): [number, number][] {
        const doorTiles: [number, number][] = [];
        for (let i = 0; i < mapSize; i++) {
            for (let j = 0; j < mapSize; j++) {
                if (grid[i][j].tileType === 'door') {
                    doorTiles.push([i, j]);
                }
            }
        }
        return doorTiles;
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

    defaultMessage() {
        return 'Toutes les portes doivent être valides';
    }
}
