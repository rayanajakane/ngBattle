import { Injectable } from '@nestjs/common';

@Injectable()
export class DebugModeService {
    private isDebugModeHashMap: Map<string, boolean> = new Map<string, boolean>();
    debugModeOn(roomId: string): void {
        this.isDebugModeHashMap.set(roomId, true);
    }
    debugModeOff(roomId): void {
        this.isDebugModeHashMap.set(roomId, false);
    }
    switchDebugMode(roomId): void {
        this.isDebugModeHashMap.set(roomId, !this.isDebugModeHashMap.get(roomId));
    }

    getDebugMode(roomId): boolean {
        return this.isDebugModeHashMap.get(roomId);
    }
}
