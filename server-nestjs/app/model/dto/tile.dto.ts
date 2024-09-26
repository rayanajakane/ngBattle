import { IsBoolean, IsInt, IsString } from 'class-validator';

export class TileDto {
    @IsInt()
    readonly idx: number;

    @IsString()
    readonly tileType: string;

    @IsString()
    readonly item: string;

    @IsBoolean()
    readonly hasPlayer: boolean;
}
