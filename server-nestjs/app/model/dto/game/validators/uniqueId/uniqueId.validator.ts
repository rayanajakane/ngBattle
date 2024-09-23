import { Game } from '@app/model/schema/game.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Model } from 'mongoose';

@ValidatorConstraint({ async: true })
@Injectable()
export class UniqueIdValidator implements ValidatorConstraintInterface {
    constructor(@InjectModel(Game.name) private gameModel: Model<Game>) {}

    async validate(id: string): Promise<boolean> {
        const filteredGamesById: Game[] = await this.gameModel.find({ id }).exec();
        return filteredGamesById.length === 0;
    }

    defaultMessage() {
        return 'A game with the ID $value already exists';
    }
}
