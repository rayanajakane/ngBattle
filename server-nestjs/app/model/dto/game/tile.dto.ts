import { IsBoolean, IsInt, IsString } from 'class-validator';

export class TileDto {
    @IsInt()
    readonly i: number;

    @IsInt()
    readonly j: number;

    @IsString()
    readonly tileType: string;

    @IsString()
    readonly item: string;

    @IsBoolean()
    readonly hasPlayer: boolean;
}
