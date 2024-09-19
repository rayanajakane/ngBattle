import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { GameDto } from '../../game.dto';
import { TileDto } from '../../tile.dto';

@ValidatorConstraint({ async: true })
@Injectable()
export class StartingPointAmountValidator implements ValidatorConstraintInterface {
    async validate(map: TileDto[], args: ValidationArguments): Promise<boolean> {
        const object = args.object as GameDto;
        const mapSize = object.mapSize;

        if (mapSize === '10') {
            const startingPoints = map.filter((tile) => tile.item === 'startingPoint').length;
            return startingPoints >= 2;
        } else if (mapSize === '15') {
            const startingPoints = map.filter((tile) => tile.item === 'startingPoint').length;
            return startingPoints >= 4;
        } else if (mapSize === '20') {
            const startingPoints = map.filter((tile) => tile.item === 'startingPoint').length;
            return startingPoints >= 6;
        }
    }

    defaultMessage(args: ValidationArguments) {
        return 'Tous les points de départ doivent être placés';
    }
}
