import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { TileDto } from '../../tile.dto';

@ValidatorConstraint({ async: true })
@Injectable()
export class TileAmountValidator implements ValidatorConstraintInterface {
    async validate(map: TileDto[], args: ValidationArguments): Promise<boolean> {
        const totalTiles = map.length;
        const emptyTiles = map.filter((tile) => tile.tileType === '').length;
        return emptyTiles / totalTiles > 0.5;
    }

    defaultMessage(args: ValidationArguments) {
        return 'Plus de 50% de la surface totale de la carte doit être occupée par des tuiles de terrain';
    }
}
