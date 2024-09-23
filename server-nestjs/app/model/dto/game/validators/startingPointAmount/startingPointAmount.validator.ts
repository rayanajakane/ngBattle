import { GameDto } from '@app/model/dto/game/game.dto';
import { TileDto } from '@app/model/dto/game/tile.dto';
import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

const REQUIRED_STARTING_POINTS_10 = 2;
const REQUIRED_STARTING_POINTS_15 = 4;
const REQUIRED_STARTING_POINTS_20 = 6;

@ValidatorConstraint({ async: true })
@Injectable()
export class StartingPointAmountValidator implements ValidatorConstraintInterface {
    async validate(map: TileDto[], args: ValidationArguments): Promise<boolean> {
        const object = args.object as GameDto;
        const mapSize = object.mapSize;
        const startingPoints = map.filter((tile) => tile.item === 'startingPoint').length;

        if (mapSize === '10') {
            return startingPoints >= REQUIRED_STARTING_POINTS_10;
        } else if (mapSize === '15') {
            return startingPoints >= REQUIRED_STARTING_POINTS_15;
        } else if (mapSize === '20') {
            return startingPoints >= REQUIRED_STARTING_POINTS_20;
        }

        return false;
    }

    defaultMessage() {
        return 'Tous les points de départ doivent être placés';
    }
}
