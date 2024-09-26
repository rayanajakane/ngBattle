import { GameJson, TileJson } from '@app/model/gameStructure';
import { Game } from '@app/model/schema/game.schema';
import { MapValidationService } from '@app/services/mapValidation.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

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
export class GameValidationService {
    constructor(
        @InjectModel(Game.name) private gameModel: Model<Game>,
        private readonly mapValidationService: MapValidationService,
    ) {}

    isValidTileJson(tile: TileJson): tile is TileJson {
        return tile && typeof tile.tileType === 'string' && typeof tile.item === 'string';
    }

    async validateGame(game: GameJson): Promise<string[]> {
        const errors: string[] = [];

        this.validateProperties(game, errors);
        this.validateMap(game, errors);
        this.validateGameName(game, errors);
        await this.validateUniqueChecks(game, errors);
        this.validateMapServices(game, errors);

        return errors;
    }

    private async isUniqueName(name: string): Promise<boolean> {
        const filteredGamesByName: Game[] = await this.gameModel.find({ gameName: name }).exec();
        return filteredGamesByName.length === 0;
    }

    private async isUniqueId(id: string): Promise<boolean> {
        const filteredGamesById: Game[] = await this.gameModel.find({ id }).exec();
        return filteredGamesById.length === 0;
    }

    private validateProperties(game: GameJson, errors: string[]): void {
        for (const { prop, emptyMsg, type, typeMsg } of propertiesToCheck) {
            if (!game[prop]) {
                errors.push(emptyMsg);
            }
            if (typeof game[prop] !== type) {
                errors.push(typeMsg);
            }
        }
    }

    private validateMap(game: GameJson, errors: string[]): void {
        if (!game.map || !Array.isArray(game.map)) {
            errors.push('La carte ne peut pas être vide et doit être un tableau');
        } else {
            for (const tile of game.map) {
                if (!this.isValidTileJson(tile)) {
                    errors.push('La carte contient des tuiles invalides');
                    break;
                }
            }
        }
    }

    private validateGameName(game: GameJson, errors: string[]): void {
        if (/\s{2,}/.test(game.gameName) || game.gameName.trim() !== game.gameName) {
            errors.push('Le nom ne doit pas contenir des espaces doubles ou des espaces au début/à la fin');
        }
        if (/[^a-zA-Z0-9 ]/.test(game.gameName)) {
            errors.push('Le nom ne doit pas contenir de symboles comme / ? ! - _');
        }
    }

    private async validateUniqueChecks(game: GameJson, errors: string[]): Promise<void> {
        if (!(await this.isUniqueName(game.gameName))) {
            errors.push('Un jeu avec ce nom existe déjà');
        }
        if (!(await this.isUniqueId(game.id))) {
            errors.push('Un jeu avec cet id existe déjà');
        }
    }

    private validateMapServices(game: GameJson, errors: string[]): void {
        if (!this.mapValidationService.hasStartingPoints(game.map, parseInt(game.mapSize, 10))) {
            errors.push("Il n'y a pas assez de points de départ");
        }
        if (!this.mapValidationService.hasCorrectGroundAmount(game.map)) {
            errors.push('Le nombre de tuiles de terrain doit etre supérieur à 50%');
        }
        if (!this.mapValidationService.areAllTilesAccessible(game.map, parseInt(game.mapSize, 10))) {
            errors.push('Toutes les tuiles ne sont pas accessibles');
        }
        if (!this.mapValidationService.areAllDoorsValid(game.map, parseInt(game.mapSize, 10))) {
            errors.push('Toutes les portes ne sont pas valides');
        }
    }
}
