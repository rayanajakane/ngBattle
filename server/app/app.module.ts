import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GameController } from './controllers/game.controller';
import { ActionGateway } from './gateways/action/action.gateway';
import { CombatGateway } from './gateways/combat/combat.gateway';
import { MatchGateway } from './gateways/match/match.gateway';
import { Game, gameSchema } from './model/schema/game.schema';
import { ActionButtonService } from './services/action-button/action-button.service';
import { ActionHandlerService } from './services/action-handler/action-handler.service';
import { ActionService } from './services/action/action.service';
import { CombatHandlerService } from './services/combat-handler/combat-handler.service';
import { CombatService } from './services/combat/combat.service';
import { DebugModeService } from './services/debug-mode/debug-mode.service';
import { GameValidationService } from './services/game-validation.service';
import { GameService } from './services/game.service';
import { MapValidationService } from './services/map-validation.service';
import { MatchService } from './services/match.service';
import { MovementService } from './services/movement/movement.service';
import { VirtualPlayerService } from './services/virtual-player/virtual-player.service';
@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(process.env.DATABASE_CONNECTION_STRING),
        MongooseModule.forFeature([{ name: Game.name, schema: gameSchema }]),
    ],
    controllers: [GameController],
    providers: [
        ActionButtonService,
        ActiveGamesService,
        GameService,
        GameValidationService,
        MapValidationService,
        ActionHandlerService,
        Logger,
        MatchService,
        MatchGateway,
        MovementService,
        ActionService,
        ActionGateway,
        CombatGateway,
        ActiveGamesService,
        CombatService,
        DebugModeService,
        VirtualPlayerService,
        {
            provide: ActionHandlerService,
            useClass: ActionHandlerService,
        },
        {
            provide: VirtualPlayerService,
            useClass: VirtualPlayerService,
        },
        CombatHandlerService,
    ],
    exports: [ActionHandlerService],
})
export class AppModule {}
