import { Injectable } from '@angular/core';
import { GameJson } from '@app/data-structure/game-structure';
import { HttpClientService } from './httpclient.service';
import { IDGenerationService } from './idgeneration.service';
import { MapService } from './map.service';

interface GameParams {
    id: string;
    gameType?: string;
    mapSize?: string;
}

@Injectable({
    providedIn: 'root',
})
export class MapDataService {
    game: GameJson;
    gameParams: GameParams;
    Size: number;

    constructor(
        private http: HttpClientService,
        private idS: IDGenerationService,
        private mapService: MapService,
    ) {}

    async gameSetup(gParams: GameParams) {
        console.log('Game setup');
        this.gameParams = gParams;
        await this.setGame(gParams.id).then(() => this.configureGame());
        console.log('end of game setup');
        console.log(this.game);
    }

    async setGame(gameId: string) {
        if (!gameId || !(this.game = await this.http.getGame(gameId))) this.game = this.createGameJSON();
        console.log('Game set');
        console.log(this.game);
    }

    configureGame() {
        if (this.game.map.length === 0) {
            this.game.gameType = this.gameParams.gameType === 'classic' ? 'classic' : 'ctf';
            this.game.mapSize = this.gameParams.mapSize === 'medium' ? '15' : this.gameParams.mapSize === 'large' ? '20' : '10';
            this.Size = parseInt(this.game.mapSize, 10);
            this.game.map = this.mapService.createGrid(this.Size);
        }
    }

    createGameJSON(): GameJson {
        return {
            id: this.idS.generateID(),
            gameName: 'Sans titre',
            gameDescription: 'Il était une fois...',
            mapSize: '10',
            map: [],
            gameType: '',
            isVisible: true,
            creationDate: '',
            lastModified: '',
        } as GameJson;
    }
}
