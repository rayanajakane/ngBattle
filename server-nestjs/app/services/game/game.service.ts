import { GameDto } from "@app/model/dto/game/game.dto";
import { Game } from "@app/model/schema/game.schema";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class GameService {
    constructor(@InjectModel(Game.name) private gameModel: Model<Game>) {}

    async create(createGameDto: GameDto): Promise<Game> {
        const filteredGamesById: Game[] = await this.findById(createGameDto.id);
        if (filteredGamesById.length === 1) {
            const existingGame = filteredGamesById[0];
            await this.gameModel.updateOne({ _id: existingGame._id }, createGameDto).exec();
            return this.gameModel.findById(existingGame._id).exec();
        }
        else {
            const createdGame = new this.gameModel(createGameDto);
            return createdGame.save();
        }
    }

    async findById(id: string): Promise<Game[]> {
        return this.gameModel.find({ id }).exec();
    }

    async findAll(): Promise<Game[]> {
        return this.gameModel.find().exec();
    }
}