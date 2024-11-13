import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

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

    startTimer(): void {
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
                if (this.isCooldown) {
                    this.server.to(this.roomId).emit('cooldownUpdate', this.currentTime);
                } else {
                    this.server.to(this.roomId).emit('timerUpdate', this.currentTime);
                }
            } else {
                if (this.isCooldown) {
                    this.clearTimer();
                    this.startMainTimer();
                } else {
                    this.clearTimer();
                    //TODO: execute the endTurn logic
                    this.server.to(this.roomId).emit('endTurn');
                }
            }
        }, 1000);
    }

    // Autres méthodes inchangées...
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
