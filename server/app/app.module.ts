import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GameController } from './controllers/game.controller';
import { ActionGateway } from './gateways/action/action.gateway';
import { MatchGateway } from './gateways/match/match.gateway';
import { Game, gameSchema } from './model/schema/game.schema';
import { ActionService } from './services/action/action.service';
import { GameValidationService } from './services/game-validation.service';
import { GameService } from './services/game.service';
import { MapValidationService } from './services/map-validation.service';
import { MatchService } from './services/match.service';
import { MovementService } from './services/movement/movement.service';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(process.env.DATABASE_CONNECTION_STRING),
        MongooseModule.forFeature([{ name: Game.name, schema: gameSchema }]),
    ],
    controllers: [GameController],
    providers: [
        GameService,
        GameValidationService,
        MapValidationService,
        Logger,
        MatchService,
        MatchGateway,
        MovementService,
        ActionService,
        ActionGateway,
    ],
})
export class AppModule {}
