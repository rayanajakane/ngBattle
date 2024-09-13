import { GameDto } from '@app/model/dto/game/game.dto';
import { Game } from '@app/model/schema/game.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class GameService {
    constructor(@InjectModel(Game.name) private gameModel: Model<Game>) {}

    async create(createGameDto: GameDto): Promise<Game> {
        const filteredGamesById: Game[] = await this.gameModel.find({ id: createGameDto.id }).exec();
        if (filteredGamesById.length === 1) {
            const existingGame = filteredGamesById[0];
            await this.gameModel.updateOne({ _id: existingGame._id }, createGameDto).exec();
            return await this.gameModel.findById(existingGame._id).exec();
        } else {
            const createdGame = new this.gameModel(createGameDto);
            return await createdGame.save();
        }
    }

    async update(updateGameDto: GameDto): Promise<Game> {
        const filteredGameById: Game = await this.gameModel.findOne({ id: updateGameDto.id }).exec();
        await this.gameModel.updateOne({ _id: filteredGameById._id }, updateGameDto).exec();
        return await this.gameModel.findById(filteredGameById._id).exec();
    }

    async delete(deleteGameDto: GameDto) {
        await this.gameModel.deleteOne({ id: deleteGameDto.id });
    }

    async get(getGameDto: GameDto): Promise<Game> {
        return await this.gameModel.findOne({ id: getGameDto.id }).exec();
    }

    async findById(id: string): Promise<Game[]> {
        return this.gameModel.find({ id }).exec();
    }

    async findAll(): Promise<Game[]> {
        return this.gameModel.find().exec();
    }
}
