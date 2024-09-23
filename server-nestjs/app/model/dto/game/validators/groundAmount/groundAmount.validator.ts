import { TileDto } from '@app/model/dto/game/tile.dto';
import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ async: true })
@Injectable()
export class GroundAmountValidator implements ValidatorConstraintInterface {
    async validate(map: TileDto[]): Promise<boolean> {
        const totalTiles = map.length;
        const emptyTiles = map.filter((tile) => tile.tileType === '').length;
        const threshold = 0.5;
        return emptyTiles / totalTiles > threshold;
    }

    defaultMessage() {
        return 'Plus de 50% de la surface totale de la carte doit être occupée par des tuiles de terrain';
    }
}
