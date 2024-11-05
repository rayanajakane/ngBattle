import { ActionGateway } from '@app/gateways/action/action.gateway';
import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
@Injectable()
export class TurnTimerService {
    constructor(private actionGt: ActionGateway) {}

    private timer: NodeJS.Timeout | null = null;
    private timeLeft: number = 30;
    private readonly TIMER_DURATION = 30;
    private readonly COOLDOWN_DURATION = 3;
    private isInCooldown = false;

    startGameTimer(server: Server, roomId: string, playerId: string) {
        if (this.timer) return;

        this.timeLeft = this.TIMER_DURATION;
        this.broadcastTime(server);

        this.timer = setInterval(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
                this.broadcastTime(server);
            } else {
                this.stopTimer(server);

                this.actionGt.handleEndTurn(null, { roomId, playerId });

                this.startCooldown(server, roomId, playerId);
            }
        }, 1000);
    }

    private startCooldown(server: Server, gameId: string, playerId: string) {
        this.isInCooldown = true;
        server.emit('timerCooldown', this.COOLDOWN_DURATION);

        setTimeout(() => {
            this.isInCooldown = false;
            this.startGameTimer(server, gameId, playerId);
        }, this.COOLDOWN_DURATION * 1000);
    }

    stopTimer(server: Server) {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
            server.emit('timerStop');
        }
    }

    private broadcastTime(server: Server) {
        server.emit('timerUpdate', this.timeLeft);
    }

    isRunning(): boolean {
        return this.timer !== null;
    }
}
