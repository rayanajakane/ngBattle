import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import 'reflect-metadata';
import { TileDto } from './tile.dto';
import { areAllDoorsValid } from './validators/allDoorsValid/allDoorsValid.decorator';
import { areAllTilesAccessible } from './validators/allTilesAccessible/allTilesAccessible.decorator';
import { hasCorrectGroundAmount } from './validators/groundAmount/groundAmount.decorator';
import { isCorrectStartingPointAmount } from './validators/startingPointAmount/startingPointAmount.decorator';
import { isUniqueId } from './validators/uniqueId/uniqueId.decorator';
import { isUniqueName } from './validators/uniqueName/uniqueName.decorator';

export class GameDto {
    @IsString({ message: 'ID must be a string' })
    @isUniqueId()
    @IsNotEmpty({ message: 'ID cannot be empty' })
    readonly id: string;

    @IsString({ message: 'Name must be a string' })
    @isUniqueName()
    @IsNotEmpty({ message: 'Le nom ne peut pas être vide' })
    readonly gameName: string;

    @IsString({ message: 'Description must be a string' })
    @IsNotEmpty({ message: 'La description ne peut pas être vide' })
    readonly gameDescription: string;

    @IsString({ message: 'Size must be a strinhg' })
    @IsNotEmpty({ message: 'Size cannot be empty' })
    readonly mapSize: string;

    @IsArray({ message: 'Map must be an array of TileJson' })
    @Type(() => TileDto)
    @ValidateNested({ each: true })
    @hasCorrectGroundAmount()
    @isCorrectStartingPointAmount()
    @areAllTilesAccessible()
    @areAllDoorsValid()
    readonly map: TileDto[];

    @IsString({ message: 'gameType must be a string' })
    @IsNotEmpty({ message: 'gameType cannot be empty' })
    readonly gameType: string;

    @IsBoolean({ message: 'isVisible must be a boolean' })
    @IsNotEmpty({ message: 'isVisible cannot be empty' })
    readonly isVisible: boolean;

    @IsString({ message: 'creationDate must be a string' })
    @IsNotEmpty({ message: 'creationDate cannot be empty' })
    readonly creationDate: string;
}
