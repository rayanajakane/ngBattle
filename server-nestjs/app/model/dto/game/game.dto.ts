import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import 'reflect-metadata';
import { TileDto } from './tile.dto';

export class GameDto {
    @IsString()
    @IsNotEmpty()
    readonly id: string;

    @IsString()
    @IsNotEmpty()
    readonly gameName: string;

    @IsString()
    @IsNotEmpty()
    readonly gameDescription: string;

    @IsString()
    @IsNotEmpty()
    readonly mapSize: string;

    @IsArray()
    @Type(() => TileDto)
    readonly map: TileDto[];

    @IsString()
    @IsNotEmpty()
    readonly gameType: string;

    @IsBoolean()
    @IsNotEmpty()
    readonly isVisible: boolean;

    @IsString()
    @IsNotEmpty()
    readonly creationDate: string;

    // TODO keep up to date with game json structure
}
