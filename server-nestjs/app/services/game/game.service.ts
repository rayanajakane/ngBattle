import { GameDto } from '@app/model/dto/game/game.dto';
import { Game } from '@app/model/schema/game.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class GameService {
    constructor(@InjectModel(Game.name) private gameModel: Model<Game>) {}

    async create(game: GameDto): Promise<Game> {
        const newGame = await this.gameModel.create(game);
        return newGame;
    }

    async update(game: GameDto): Promise<Game> {
        return await this.gameModel.findOneAndUpdate({ id: game.id }, game).exec();
    }

    async changeVisibility(gameId: string): Promise<Game> {
        const filteredGameById: Game = await this.gameModel.findOne({ id: gameId }).exec();
        return await this.gameModel.findOneAndUpdate({ id: gameId }, { isVisible: !filteredGameById.isVisible }).exec();
    }

    async delete(gameId: string) {
        await this.gameModel.deleteOne({ id: gameId });
    }

    async get(gameId: string): Promise<Game> {
        return await this.gameModel.findOne({ id: gameId }).exec();
    }

    async getAll(): Promise<Game[]> {
        return await this.gameModel.find().exec();
    }
}
