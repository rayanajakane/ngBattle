import { Injectable } from '@nestjs/common';

@Injectable()
export class DebugModeService {
    private isDebugMode = false;

    debugModeOn(): void {
        this.isDebugMode = true;
    }

    debugModeOff(): void {
        this.isDebugMode = false;
    }
    isDebugModeActive(): boolean {
        return this.isDebugMode;
    }
}
