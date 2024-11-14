import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { ActionHandlerService } from '../action-handler/action-handler.service';

@Injectable()
export class TimerService {
    private static readonly INITIAL_TIME = 30;
    private static readonly COOLDOWN_TIME = 3;
    private intervalId: NodeJS.Timeout | null = null;
    private currentTime: number = TimerService.INITIAL_TIME;
    private isPaused: boolean = false;
    private server: Server;
    private roomId: string;
    private isCooldown: boolean = false;
    private playerId: string;

    constructor(
        server: Server,
        roomId: string,
        private actionHandler: ActionHandlerService,
    ) {
        this.server = server;
        this.roomId = roomId;
    }

    startTimer(playerId: string): void {
        this.playerId = playerId;

        if (this.intervalId) {
            this.clearTimer();
        }
        this.startCooldown();
    }

    private startCooldown(): void {
        this.currentTime = TimerService.COOLDOWN_TIME;
        this.isPaused = false;
        this.isCooldown = true;
        this.startInterval();
    }

    private startMainTimer(): void {
        this.currentTime = TimerService.INITIAL_TIME;
        this.isPaused = false;
        this.isCooldown = false;
        this.startInterval();
    }

    private startInterval(): void {
        this.intervalId = setInterval(() => {
            if (this.currentTime > 0) {
                this.currentTime--;
                this.server.to(this.roomId).emit('timerUpdate', this.currentTime);
            } else {
                if (this.isCooldown) {
                    this.clearTimer();
                    this.server.to(this.roomId).emit('endCooldown');
                    this.startMainTimer();
                } else {
                    this.clearTimer();
                    this.server.to(this.roomId).emit('timerUpdate', 0);
                    this.server.to(this.roomId).emit('endTimer');
                }
            }
        }, 1000);
    }

    pauseTimer(): void {
        if (this.intervalId && !this.isPaused) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.isPaused = true;
        }
    }

    resumeTimer(): void {
        if (this.isPaused) {
            this.isPaused = false;
            this.startInterval();
        }
    }

    resetTimer(): void {
        this.clearTimer();
        this.isCooldown = false;
        this.currentTime = TimerService.INITIAL_TIME;
    }

    getCurrentTime(): number {
        return this.currentTime;
    }

    isPausedState(): boolean {
        return this.isPaused;
    }

    private clearTimer(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isPaused = false;
    }

    onDestroy(): void {
        this.clearTimer();
    }
}
