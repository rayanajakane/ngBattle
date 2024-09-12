import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateGameDto {
    @ApiProperty()
    @IsString()
    name: string;

    // TODO add more fields
}