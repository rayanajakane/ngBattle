import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import 'reflect-metadata';
import { TileDto } from './tile.dto';

export class GameDto {
    @IsString({ message: 'ID must be a string' })
    @IsNotEmpty({ message: 'ID cannot be empty' })
    readonly id: string;

    @IsString({ message: 'Name must be a string' })
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
