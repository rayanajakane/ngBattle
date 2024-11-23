import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class CombatTimerService {
    private static readonly TIME = 5;
    private static readonly TIME_NO_ESCAPE = 3;
    private intervalId: NodeJS.Timeout | null = null;
    private currentTime: number = CombatTimerService.TIME;
    private server: Server;
    private roomId: string;

    constructor(server: Server, roomId: string) {
        this.server = server;
        this.roomId = roomId;
    }

    startTimer(hasEscape: boolean): void {
        if (this.intervalId) {
            this.clearTimer();
        }
        this.startInterval(hasEscape);
    }

    private setTimer(hasEscape: boolean): void {
        if (hasEscape) {
            this.currentTime = CombatTimerService.TIME;
        } else {
            this.currentTime = CombatTimerService.TIME_NO_ESCAPE;
        }
    }
    private startInterval(hasEscape: boolean): void {
        this.setTimer(hasEscape);
        this.intervalId = setInterval(() => {
            if (this.currentTime > 0) {
                this.currentTime--;
                this.server.to(this.roomId).emit('CombatTimerUpdate', this.currentTime);
            } else {
                this.clearTimer();
                this.server.to(this.roomId).emit('CombatTimerUpdate', 0);
                this.server.to(this.roomId).emit('endCombatTimer');
            }
        }, 1000);
    }
    resetTimer(): void {
        this.clearTimer();
        this.server.to(this.roomId).emit('CombatTimerUpdate', this.currentTime);
    }
    private clearTimer(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    onDestroy(): void {
        this.clearTimer();
    }
}
