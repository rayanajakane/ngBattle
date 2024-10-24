import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GameJson } from '@app/data-structure/game-structure';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { map } from 'rxjs/operators';
@Injectable({
    providedIn: 'root',
})
export class HttpClientService {
    private readonly baseUrl = environment.serverUrl + '/api';

    constructor(private httpService: HttpClient) {}

    async gameExists(id: string): Promise<boolean> {
        return (await this.getGame(id)) !== null;
    }

    sendGame(gameJson: GameJson) {
        gameJson.creationDate = new Date().toISOString();
        gameJson.lastModified = new Date().toLocaleString('en-GB', { timeZone: 'America/Toronto' });
        // eslint-disable-next-line @typescript-eslint/naming-convention
        return this.httpService.post(`${this.baseUrl}/game/upload/`, gameJson, { headers: { 'Content-Type': 'application/json' } });
    }

    async getGame(id: string): Promise<GameJson> {
        return await firstValueFrom(this.httpService.get<GameJson>(`${this.baseUrl}/game/get/` + id));
    }

    async getAllGames(): Promise<GameJson[]> {
        return await firstValueFrom(
            this.httpService
                .get<GameJson[]>(`${this.baseUrl}/game/getAll/`)
                .pipe(map((games: GameJson[]) => games.sort((a, b) => new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime()))),
        );
    }

    deleteGame(id: string) {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        return this.httpService.delete(`${this.baseUrl}/game/delete/` + id, { headers: { 'Content-Type': 'application/json' } });
    }

    updateGame(gameJson: GameJson) {
        gameJson.lastModified = new Date().toLocaleString('en-GB', { timeZone: 'America/Toronto' });
        // eslint-disable-next-line @typescript-eslint/naming-convention
        return this.httpService.patch(`${this.baseUrl}/game/update/`, gameJson, { headers: { 'Content-Type': 'application/json' } });
    }

    changeVisibility(id: string) {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        return this.httpService.patch(`${this.baseUrl}/game/changeVisibility/` + id, {}, { headers: { 'Content-Type': 'application/json' } });
    }
}
