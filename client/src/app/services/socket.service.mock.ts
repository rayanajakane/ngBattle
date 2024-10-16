import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class MockSocketService {
    private mockConnected = false;
    // eslint-disable-next-line
    private mockEvents: { [key: string]: any[] } = {};

    isSocketAlive() {
        return this.mockConnected;
    }

    connect() {
        this.mockConnected = true;
    }

    disconnect() {
        this.mockConnected = false;
    }

    on<T>(event: string, action: (data: T) => void): void {
        if (!this.mockEvents[event]) {
            this.mockEvents[event] = [];
        }
        this.mockEvents[event].push(action);
    }

    emit<T>(event: string, data?: T, callback?: () => void): void {
        // Trigger the event if any listener is registered
        if (this.mockEvents[event]) {
            this.mockEvents[event].forEach((action: (data?: T) => void) => action(data));
        }
        if (callback) {
            callback();
        }
    }

    once<T>(event: string, action: (data: T) => void): void {
        // Similar to `on`, but you can implement logic to remove the listener after it's called
        this.on(event, action);
    }
}
