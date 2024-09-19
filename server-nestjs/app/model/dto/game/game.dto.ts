import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import 'reflect-metadata';
import { TileDto } from './tile.dto';
import { IsUniqueId } from './validators/uniqueId/uniqueId.decorator';
import { IsUniqueName } from './validators/uniqueName/uniqueName.decorator';

export class GameDto {
    @IsString({ message: 'ID must be a string' })
    @IsUniqueId()
    @IsNotEmpty({ message: 'ID cannot be empty' })
    readonly id: string;

    @IsString({ message: 'Name must be a string' })
    @IsUniqueName()
    @IsNotEmpty({ message: 'Name cannot be empty' })
    readonly gameName: string;

    @IsString({ message: 'Description must be a string' })
    @IsNotEmpty({ message: 'Description cannot be empty' })
    readonly gameDescription: string;

    @IsString({ message: 'Size must be a string' })
    @IsNotEmpty({ message: 'Size cannot be empty' })
    readonly mapSize: string;

    @IsArray({ message: 'Map must be an array of TileJson' })
    @Type(() => TileDto)
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
