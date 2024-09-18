import { GameDto } from '@app/model/dto/game/game.dto';
import { Game } from '@app/model/schema/game.schema';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class GameService {
    constructor(@InjectModel(Game.name) private gameModel: Model<Game>) {}

    async create(createGameDto: GameDto): Promise<Game> {
        const filteredGamesById: Game[] = await this.gameModel.find({ id: createGameDto.id }).exec();
        const filteredGamesByName: Game[] = await this.gameModel.find({ gameName: createGameDto.gameName }).exec();

        if (filteredGamesById.length > 0) {
            throw new HttpException('Game with this ID already exists', HttpStatus.CONFLICT);
        } else if (filteredGamesByName.length > 0) {
            throw new HttpException('Game with this name already exists', HttpStatus.CONFLICT);
        } else {
            const createdGame = new this.gameModel(createGameDto);
            return await createdGame.save();
        }
    }

    async update(updateGameDto: GameDto): Promise<Game> {
        await this.gameModel.updateOne({ id: updateGameDto.id }, updateGameDto).exec();
        return await this.gameModel.findOne({ id: updateGameDto.id }).exec();
    }

    async changeVisibility(gameId: string) {
        const filteredGameById: Game = await this.gameModel.findOne({ id: gameId }).exec();
        await this.gameModel.updateOne({ _id: filteredGameById._id }, { isVisible: !filteredGameById.isVisible }).exec();
    }

    async delete(deleteGameID: string) {
        await this.gameModel.deleteOne({ id: deleteGameID });
    }

    async get(getGameID: string): Promise<Game> {
        return await this.gameModel.findOne({ id: getGameID }).exec();
    }

    async findById(id: string): Promise<Game[]> {
        return this.gameModel.find({ id }).exec();
    }

    async getAll(): Promise<Game[]> {
        return await this.gameModel.find().exec();
    }
}
