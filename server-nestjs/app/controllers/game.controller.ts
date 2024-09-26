import { GameJson } from '@app/model/gameStructure';
import { GameService } from '@app/services/game.service';
import { GameValidationService } from '@app/services/gameValidation.service';
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post } from '@nestjs/common';

@Controller('game')
export class GameController {
    constructor(
        private readonly gameService: GameService,
        private readonly validationService: GameValidationService,
    ) {}

    @Post('upload')
    async uploadGame(@Body() gameData: GameJson) {
        const errors = await this.validationService.validateGame(gameData);
        if (errors.length > 0) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'Validation failed',
                    errors,
                },
                HttpStatus.BAD_REQUEST,
            );
        }
        return await this.gameService.create(gameData);
    }

    @Patch('update')
    async updateGame(@Body() gameData: GameJson) {
        const errors = await this.validationService.validateGame(gameData);
        if (errors.length > 0) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'Validation failed',
                    errors,
                },
                HttpStatus.BAD_REQUEST,
            );
        }
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
