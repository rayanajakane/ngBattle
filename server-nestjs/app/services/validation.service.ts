import { Game } from '@app/model/schema/game.schema';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameJson, TileJson } from '../model/gameStructure';

const propertiesToCheck = [
    { prop: 'gameName', emptyMsg: 'Le nom ne peut pas être vide', type: 'string', typeMsg: 'Le nom doit être une chaîne de caractères' },
    { prop: 'id', emptyMsg: "L'id ne peut pas être vide", type: 'string', typeMsg: "L'id doit être une chaîne de caractères" },
    {
        prop: 'gameDescription',
        emptyMsg: 'La description ne peut pas être vide',
        type: 'string',
        typeMsg: 'La description doit être une chaîne de caractères',
    },
    { prop: 'mapSize', emptyMsg: 'La taille ne peut pas être vide', type: 'string', typeMsg: 'La taille doit être une chaîne de caractères' },
    { prop: 'gameType', emptyMsg: 'Le type ne peut pas être vide', type: 'string', typeMsg: 'Le type doit être une chaîne de caractères' },
    {
        prop: 'creationDate',
        emptyMsg: 'La date de création ne peut pas être vide',
        type: 'string',
        typeMsg: 'La date de création doit être une chaîne de caractères',
    },
];

@Injectable()
export class ValidationService {
    constructor(@InjectModel(Game.name) private gameModel: Model<Game>) {}

    isValidTileJson(tile: any): tile is TileJson {
        return tile && typeof tile.tileType === 'string' && typeof tile.item === 'string';
    }

    async validateGame(game: GameJson): Promise<string[]> {
        const errors: string[] = [];

        for (const { prop, emptyMsg, type, typeMsg } of propertiesToCheck) {
            if (!game[prop]) {
                errors.push(emptyMsg);
            }
            if (typeof game[prop] !== type) {
                errors.push(typeMsg);
            }
        }

        if (!game.map || !Array.isArray(game.map)) {
            errors.push('La carte ne peut pas être vide et doit être un tableau');
        } else {
            for (const tile of game.map) {
                if (!this.isValidTileJson(tile)) {
                    errors.push('La carte contient des éléments invalides');
                    break;
                }
            }
        }
        if (game.isVisible === undefined) {
            errors.push('La visibilité ne peut pas être vide');
        }
        if (typeof game.isVisible !== 'boolean') {
            errors.push('La visibilité doit être un booléen');
        }
        if (/\s{2,}/.test(game.gameName) || game.gameName.trim() !== game.gameName) {
            errors.push('Le nom ne doit pas contenir des espaces doubles ou des espaces au début/à la fin');
        }
        if (!(await this.isUniqueName(game.gameName))) {
            errors.push('Un jeu avec ce nom existe déjà');
        }
        if (!(await this.isUniqueId(game.id))) {
            errors.push('Un jeu avec cet id existe déjà');
        }
        if (!this.hasStartingPoints(game.map, parseInt(game.mapSize))) {
            errors.push("Il n'y a pas assez de points de départ");
        }
        if (!this.hasCorrectGroundAmount(game.map)) {
            errors.push('Le nombre de tuiles de terrain doit etre supérieur à 50%');
        }
        if (!this.areAllTilesAccessible(game.map, parseInt(game.mapSize))) {
            errors.push('Toutes les tuiles ne sont pas accessibles');
        }
        if (!this.areAllDoorsValid(game.map, parseInt(game.mapSize))) {
            errors.push('Toutes les portes ne sont pas valides');
        }

        return errors;
    }

    async isUniqueName(name: string): Promise<boolean> {
        const filteredGamesByName: Game[] = await this.gameModel.find({ gameName: name }).exec();
        return filteredGamesByName.length === 0;
    }

    async isUniqueId(id: string): Promise<boolean> {
        const filteredGamesById: Game[] = await this.gameModel.find({ id }).exec();
        return filteredGamesById.length === 0;
    }

    hasStartingPoints(map: TileJson[], mapSize: number) {
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

    hasCorrectGroundAmount(map: TileJson[]) {
        const terrainTiles = ['', 'grass', 'water', 'ice'];
        const totalTiles = map.length;
        const emptyTiles = map.filter((tile) => terrainTiles.includes(tile.tileType)).length;
        const threshold = 0.5;
        return emptyTiles / totalTiles > threshold;
    }

    areAllTilesAccessible(map: TileJson[], mapSize: number) {
        const grid = this.createGrid(map, mapSize);
        const terrainDoorTiles = this.extractTiles(grid, mapSize, ['', 'water', 'ice', 'doorOpen', 'doorClosed']);

        // redundant check to see if we have no ground tiles (shouldn't happen anyway since we need more than 50% of terrain tiles)
        if (terrainDoorTiles.length === 0) {
            return true;
        }

        return this.allGroundTilesAccessible(grid, terrainDoorTiles, mapSize);
    }

    areAllDoorsValid(map: TileJson[], mapSize: number) {
        const grid = this.createGrid(map, mapSize);
        const doorTiles = this.extractTiles(grid, mapSize, ['doorClosed', 'doorOpen']);
        return this.allDoorsValid(grid, doorTiles, mapSize);
    }

    createGrid(map: TileJson[], mapSize: number): TileJson[][] {
        if (map.length !== mapSize ** 2) {
            throw new HttpException('La taille de la carte ne correspond pas à la taille spécifiée', 400);
        }
        const grid: TileJson[][] = [];
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

    extractTiles(grid: TileJson[][], mapSize: number, tileTypes: string[]): [number, number][] {
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

    isHorizontalDoor(grid: TileJson[][], i: number, j: number, mapSize: number): boolean {
        return i > 0 && i < mapSize - 1 && grid[i - 1][j].tileType === 'wall' && grid[i + 1][j].tileType === 'wall';
    }

    isInvalidHorizontalDoor(grid: TileJson[][], i: number, j: number, mapSize: number): boolean {
        return (
            this.isHorizontalDoor(grid, i, j, mapSize) &&
            !(j > 0 && j < mapSize - 1 && grid[i][j - 1].tileType === '' && grid[i][j + 1].tileType === '')
        );
    }

    isVerticalDoor(grid: TileJson[][], i: number, j: number, mapSize: number): boolean {
        return j > 0 && j < mapSize - 1 && grid[i][j - 1].tileType === 'wall' && grid[i][j + 1].tileType === 'wall';
    }

    isInvalidVerticalDoor(grid: TileJson[][], i: number, j: number, mapSize: number): boolean {
        return (
            this.isVerticalDoor(grid, i, j, mapSize) &&
            !(i > 0 && i < mapSize - 1 && grid[i - 1][j].tileType === '' && grid[i + 1][j].tileType === '')
        );
    }

    allDoorsValid(grid: TileJson[][], doorTiles: [number, number][], mapSize: number): boolean {
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

    allGroundTilesAccessible(grid: TileJson[][], terrainDoorTiles: [number, number][], mapSize: number): boolean {
        const directions = [
            [0, 1],
            [1, 0],
            [0, -1],
            [-1, 0],
        ];
        const tileTypes = ['', 'water', 'ice', 'doorOpen', 'doorClosed'];
        const visited = new Set<string>();
        const queue: [number, number][] = [terrainDoorTiles[0]];
        visited.add(terrainDoorTiles[0].toString());

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
                    tileTypes.includes(grid[nx][ny].tileType) // check n is a terrain or door tile
                ) {
                    queue.push([nx, ny]);
                    visited.add([nx, ny].toString());
                }
            }
        }

        for (const [x, y] of terrainDoorTiles) {
            if (!visited.has([x, y].toString())) {
                return false;
            }
        }

        return true;
    }
}
