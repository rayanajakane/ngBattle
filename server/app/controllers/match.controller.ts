import { MatchService } from '@app/services/match.service';
import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';

@Controller('match')
export class MatchController {
    constructor(private readonly matchService: MatchService) {}

    @Post('/')
    getMatch(@Body() body: { gameId: string; adminName: string; avatar: string }) {
        return this.matchService.createMatch(body.gameId, body.adminName, body.avatar);
    }

    @Patch('/:matchId')
    joinMatch(@Body() body: { matchId: number; playerName: string; avatar: string }) {
        return this.matchService.joinMatch(body.matchId, body.playerName, body.avatar);
    }

    @Patch('/kickPlayer')
    kickPlayer(@Body() body: { matchId: number; adminId: string; playerId: string; reason: string }) {
        return this.matchService.kickPlayer(body.matchId, body.adminId, body.playerId, body.reason);
    }

    @Patch('/lockMatch')
    lockUnlockMatch(@Body() body: { matchId: number; adminId: string }) {
        return this.matchService.lockUnlockMatch(body.matchId, body.adminId);
    }

    @Get('/:matchId')
    getAllPlayers(@Param('matchId') id: number) {
        return this.matchService.getAllPlayers(id);
    }
}
