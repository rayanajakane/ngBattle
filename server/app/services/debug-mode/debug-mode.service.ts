import { Injectable } from '@nestjs/common';

@Injectable()
export class DebugModeService {
    private debugMode = false;

    toggleDebugMode(): void {
        this.debugMode = !this.debugMode;
    }

    isDebugModeActive(): boolean {
        return this.debugMode;
    }
}
