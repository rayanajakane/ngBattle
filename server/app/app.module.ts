import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GameController } from './controllers/game.controller';
import { Game, gameSchema } from './model/schema/game.schema';
import { GameValidationService } from './services/game-validation.service';
import { GameService } from './services/game.service';
import { MapValidationService } from './services/map-validation.service';
import { MatchService } from './services/match.service';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(process.env.DATABASE_CONNECTION_STRING),
        MongooseModule.forFeature([{ name: Game.name, schema: gameSchema }]),
    ],
    controllers: [GameController],
    providers: [GameService, GameValidationService, MapValidationService, Logger, MatchService],
})
export class AppModule {}
