import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameController } from './controllers/game/game.controller';
import { AllTilesAccessibleValidator } from './model/dto/game/validators/allTilesAccessible/allTilesAccessible.validator';
import { GroundAmountValidator } from './model/dto/game/validators/groundAmount/groundAmount.validator';
import { StartingPointAmountValidator } from './model/dto/game/validators/startingPointAmount/startingPointAmount.validator';
import { UniqueIdValidator } from './model/dto/game/validators/uniqueId/uniqueId.validator';
import { UniqueNameValidator } from './model/dto/game/validators/uniqueName/uniqueName.validator';
import { Game, gameSchema } from './model/schema/game.schema';
import { GameService } from './services/game/game.service';

@Module({
    imports: [
        MongooseModule.forRoot(
            'mongodb+srv://208projet2:XFZ8wM31iW7K8Kjq@cluster0.iy2emsj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
        ),
        // TODO figure out how to put the connection string in the .env file
        MongooseModule.forFeature([{ name: Game.name, schema: gameSchema }]),
    ],
    controllers: [GameController],
    providers: [
        GameService,
        Logger,
        UniqueNameValidator,
        UniqueIdValidator,
        GroundAmountValidator,
        StartingPointAmountValidator,
        AllTilesAccessibleValidator,
    ],
})
export class AppModule {}
