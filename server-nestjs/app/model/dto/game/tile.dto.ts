import { IsArray, IsBoolean, IsInt, IsString } from 'class-validator';

export class TileDto {
    @IsInt()
    readonly i: number;

    @IsInt()
    readonly j: number;

    @IsString()
    readonly tileType: string;

    @IsArray()
    @IsString({ each: true })
    readonly items: string[];

    @IsBoolean()
    readonly hasPlayer: boolean;
}
