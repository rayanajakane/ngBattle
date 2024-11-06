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
    private isPaused = false;
    private pausedTimeLeft: number | null = null;

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

                this.actionGt.handleEndTurn(null, { roomId, playerId, lastTurn: false });

                this.startCooldown(server, roomId, playerId);
            }
        }, 1000);
    }

    pauseTimer(server: Server) {
        if (!this.timer || this.isPaused) return;

        this.isPaused = true;
        this.pausedTimeLeft = this.timeLeft;
        clearInterval(this.timer);
        this.timer = null;
        server.emit('timerPaused', this.timeLeft);
    }

    resumeTimer(server: Server, roomId: string, playerId: string) {
        if (!this.isPaused || this.timer) return;

        this.isPaused = false;
        this.timeLeft = this.pausedTimeLeft ?? this.TIMER_DURATION;
        this.pausedTimeLeft = null;

        this.timer = setInterval(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
                this.broadcastTime(server);
            } else {
                this.stopTimer(server);
                this.actionGt.handleEndTurn(null, { roomId, playerId, lastTurn: false });
                this.startCooldown(server, roomId, playerId);
            }
        }, 1000);

        server.emit('timerResumed', this.timeLeft);
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
