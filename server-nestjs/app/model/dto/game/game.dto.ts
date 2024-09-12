import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { TileDto } from './tile.dto';

export class GameDto {
    @IsNotEmpty()
    @IsString()
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
    readonly map: TileDto[][];

    @IsString()
    @IsNotEmpty()
    readonly gameType: string;

    // TODO keep up to date with game json structure
}
