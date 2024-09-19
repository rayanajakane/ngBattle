import { Game } from '@app/model/schema/game.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Model } from 'mongoose';

@ValidatorConstraint({ async: true })
@Injectable()
export class UniqueNameValidator implements ValidatorConstraintInterface {
    constructor(@InjectModel(Game.name) private gameModel: Model<Game>) {}

    async validate(name: string, args: ValidationArguments): Promise<boolean> {
        const filteredGamesByName: Game[] = await this.gameModel.find({ gameName: name }).exec();
        return filteredGamesByName.length === 0;
    }

    defaultMessage(args: ValidationArguments) {
        return 'Un jeu avec le nom $value existe déjà';
    }
}
