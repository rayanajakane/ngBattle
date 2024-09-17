import { GameDto } from '@app/model/dto/game/game.dto';
import { GameService } from '@app/services/game/game.service';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

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

    @Patch('changeVisibility/:id')
    async changeVisibility(@Param('id') id: string) {
        await this.gameService.changeVisibility(id);
    }

    @Delete('delete/:id')
    async deleteGame(@Param('id') id: string) {
        await this.gameService.delete(id);
    }

    @Get('get/:id')
    async getGame(@Param('id') id: string) {
        return await this.gameService.get(id);
    }

    @Get('getAll')
    async getAllGames() {
        return await this.gameService.getAll();
    }
}
