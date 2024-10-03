import { MatchService } from '@app/services/match.service';
import { Body, Controller, Param, Patch, Post } from '@nestjs/common';

@Controller('match')
export class MatchController {
    constructor(private readonly matchService: MatchService) {}

    @Post('/:gameId')
    getMatch(@Param('gameId') id: string) {
        return this.matchService.createMatch(id);
    }

    @Patch('/:matchId')
    joinMatch(@Param('matchId') id: number) {
        return this.matchService.joinMatch(id);
    }

    @Patch('/kickPlayer')
    kickPlayer(@Body() body: { matchId: number; adminId: string; playerId: string; reason: string }) {
        return this.matchService.kickPlayer(body.matchId, body.adminId, body.playerId, body.reason);
    }

    @Patch('/lockMatch')
    lockUnlockMatch(@Body() body: { matchId: number; adminId: string }) {
        return this.matchService.lockUnlockMatch(body.matchId, body.adminId);
    }
}
