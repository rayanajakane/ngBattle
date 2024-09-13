import { GameDto } from '@app/model/dto/game/game.dto';
import { GameService } from '@app/services/game/game.service';
import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';

@Controller('game')
export class GameController {
    constructor(private readonly gameService: GameService) {}

    @Post('upload')
    async uploadGame(@Body() gameData: GameDto) {
        return await this.gameService.create(gameData);
    }

    @Patch('update')
    async updateGame(@Body() gameData: GameDto) {
        return await this.gameService.update(gameData);
    }

    @Delete('delete')
    async deleteGame(@Body() gameData: GameDto) {
        await this.gameService.delete(gameData);
    }

    @Get('get')
    async getGame(@Body() gameData: GameDto) {
        return await this.gameService.get(gameData);
    }
}
