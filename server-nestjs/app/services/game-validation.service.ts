import { GameJson, TileJson } from '@app/model/game-structure';
import { Game } from '@app/model/schema/game.schema';
import { MapValidationService } from '@app/services/map-validation.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class GameValidationService {
    readonly propertiesToCheck = [
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
        {
            prop: 'lastModified',
            emptyMsg: 'La date de modification ne peut pas être vide',
            type: 'string',
            typeMsg: 'La date de modification doit être une chaîne de caractères',
        },
    ];

    errors: string[] = [];

    constructor(
        @InjectModel(Game.name) private gameModel: Model<Game>,
        private readonly mapValidationService: MapValidationService,
    ) {}

    async validateNewGame(game: GameJson): Promise<string[]> {
        this.errors = [];

        this.validateProperties(game);
        this.validateMap(game);
        this.validateGameName(game);
        await this.validateUniqueChecks(game);

        return this.errors;
    }

    async validateUpdatedGame(game: GameJson): Promise<string[]> {
        this.errors = [];

        this.validateProperties(game);
        this.validateMap(game);
        this.validateGameName(game);
        if (!(await this.isUniqueNameUpdate(game.gameName, game.id))) {
            this.errors.push('Un jeu avec ce nom existe déjà');
        }

        return this.errors;
    }

    async isUniqueName(name: string): Promise<boolean> {
        const filteredGamesByName: Game[] = await this.gameModel.find({ gameName: name }).exec();
        return filteredGamesByName.length === 0;
    }

    async isUniqueNameUpdate(name: string, id: string): Promise<boolean> {
        const filteredGamesByName: Game[] = await this.gameModel.find({ gameName: name, id: { $ne: id } }).exec();
        return filteredGamesByName.length === 0;
    }

    async isUniqueId(id: string): Promise<boolean> {
        const filteredGamesById: Game[] = await this.gameModel.find({ id }).exec();
        return filteredGamesById.length === 0;
    }

    validateProperties(game: GameJson): void {
        for (const { prop, emptyMsg, type, typeMsg } of this.propertiesToCheck) {
            if (!game[prop]) {
                this.errors.push(emptyMsg);
            }
            if (typeof game[prop] !== type) {
                this.errors.push(typeMsg);
            }
        }
    }

    isValidTileJson(tile: TileJson): boolean {
        if (
            tile &&
            typeof tile.idx === 'number' &&
            tile.idx >= 0 &&
            typeof tile.tileType === 'string' &&
            typeof tile.item === 'string' &&
            typeof tile.hasPlayer === 'boolean'
        ) {
            return true;
        }
        return false;
    }

    validateMap(game: GameJson): void {
        if (!game.map || !Array.isArray(game.map)) {
            this.errors.push('La carte ne peut pas être vide et doit être un tableau');
            return;
        } else {
            for (const tile of game.map) {
                if (!this.isValidTileJson(tile)) {
                    this.errors.push('La carte contient des tuiles invalides');
                    break;
                }
            }
        }
        this.validateMapServices(game);
    }

    validateGameName(game: GameJson): void {
        if (/\s{2,}/.test(game.gameName) || game.gameName.trim() !== game.gameName) {
            this.errors.push('Le nom ne doit pas contenir des espaces doubles ou des espaces au début/à la fin');
        }
        if (/[^a-zA-Z0-9 ]/.test(game.gameName)) {
            this.errors.push('Le nom ne doit pas contenir de symboles comme / ? ! - _');
        }
    }

    async validateUniqueChecks(game: GameJson): Promise<void> {
        if (!(await this.isUniqueName(game.gameName))) {
            this.errors.push('Un jeu avec ce nom existe déjà');
        }
        if (!(await this.isUniqueId(game.id))) {
            this.errors.push('Un jeu avec cet id existe déjà');
        }
    }

    validateMapServices(game: GameJson): void {
        if (game.map.length !== parseInt(game.mapSize, 10) ** 2) {
            this.errors.push('La taille de la carte ne correspond pas à la taille de la carte');
            return; // return early to avoid further errors in MapValidationService
        }
        if (!this.mapValidationService.hasStartingPoints(game.map, parseInt(game.mapSize, 10))) {
            this.errors.push("Il n'y a pas assez de points de départ");
        }
        if (!this.mapValidationService.hasCorrectGroundAmount(game.map)) {
            this.errors.push('Le nombre de tuiles de terrain doit etre supérieur à 50%');
        }
        if (!this.mapValidationService.areAllTilesAccessible(game.map, parseInt(game.mapSize, 10))) {
            this.errors.push('Toutes les tuiles ne sont pas accessibles');
        }
        if (!this.mapValidationService.areAllDoorsValid(game.map, parseInt(game.mapSize, 10))) {
            this.errors.push('Toutes les portes ne sont pas valides');
        }
    }
}
