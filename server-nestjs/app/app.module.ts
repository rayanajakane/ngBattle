import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameController } from './controllers/game.controller';
import { Game, gameSchema } from './model/schema/game.schema';
import { GameService } from './services/game.service';
import { MapValidationService } from './services/mapValidation.service';
import { GameValidationService } from './services/validation.service';

@Module({
    imports: [
        MongooseModule.forRoot(
            'mongodb+srv://208projet2:XFZ8wM31iW7K8Kjq@cluster0.iy2emsj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
        ),
        // TODO figure out how to put the connection string in the .env file
        MongooseModule.forFeature([{ name: Game.name, schema: gameSchema }]),
    ],
    controllers: [GameController],
    providers: [GameService, GameValidationService, MapValidationService, Logger],
})
export class AppModule {}
