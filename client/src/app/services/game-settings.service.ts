import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class GameSettingsService {
    // TODO: merge this service w/ map service
    gameType: string;
    mapSize: number;

    setGameType(type: string) {
        this.gameType = type;
    }

    setMapSize(size: number) {
        this.mapSize = size;
    }
}
