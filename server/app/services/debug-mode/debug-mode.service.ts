import { Injectable } from '@nestjs/common';

@Injectable()
export class DebugModeService {
    private debugMode = false;

    toggleDebugMode(): void {
        this.debugMode = !this.debugMode;
        console.log('Debug mode is now ' + (this.debugMode ? 'active' : 'inactive'));
    }

    isDebugModeActive(): boolean {
        return this.debugMode;
    }
}
