import { GameService } from '@app/services/game/game.service';
import { Body, Controller, Post } from '@nestjs/common';

@Controller('game')
export class GameController {
    constructor(private readonly gameService: GameService) {
        console.log('GameController created');
    }

    // TODO add swagger documentation

    @Post('/upload')
    uploadGame(@Body() gameData: any) { // FIXME add type
        this.gameService.uploadGame(gameData);
    }
}