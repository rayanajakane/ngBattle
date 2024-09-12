import { GameDto } from '@app/model/dto/game/game.dto';
import { GameService } from '@app/services/game/game.service';
import { Body, Controller, Post, Put } from '@nestjs/common';

@Controller('game')
export class GameController {
    constructor(private readonly gameService: GameService) {}

    @Post('upload')
    uploadGame(@Body() gameData: GameDto) {
        return this.gameService.create(gameData);
    }

    @Put('update')
    updateGame(@Body() gameData: GameDto) {
        return this.gameService.update(gameData);
    }
}
