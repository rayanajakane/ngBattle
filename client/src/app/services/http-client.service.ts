import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Game } from '@app/data-structure/game-structure';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
@Injectable({
    providedIn: 'root',
})
export class HttpClientService {
    private readonly baseUrl = environment.serverUrl + '/api';

    constructor(private httpService: HttpClient) {}

    async gameExists(id: string): Promise<boolean> {
        return (await this.getGame(id)) !== null;
    }

    sendGame(gameJson: Game) {
        gameJson.creationDate = new Date().toISOString();
        gameJson.lastModified = new Date().toLocaleString('en-GB', { timeZone: 'America/Toronto' });
        // disabling to allow for the use of 'Content-Type' in train case as camelCase is required by eslint
        // eslint-disable-next-line @typescript-eslint/naming-convention
        return this.httpService.post(`${this.baseUrl}/game/upload/`, gameJson, { headers: { 'Content-Type': 'application/json' } });
    }

    async getGame(id: string): Promise<Game> {
        return await firstValueFrom(this.httpService.get<Game>(`${this.baseUrl}/game/get/` + id));
    }

    async getAllGames(): Promise<Game[]> {
        return await firstValueFrom(
            this.httpService
                .get<Game[]>(`${this.baseUrl}/game/getAll/`)
                .pipe(map((games: Game[]) => games.sort((a, b) => new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime()))),
        );
    }

    deleteGame(id: string) {
        // disabling to allow for the use of 'Content-Type' in train case as camelCase is required by eslint
        // eslint-disable-next-line @typescript-eslint/naming-convention
        return this.httpService.delete(`${this.baseUrl}/game/delete/` + id, { headers: { 'Content-Type': 'application/json' } });
    }

    updateGame(gameJson: Game) {
        gameJson.lastModified = new Date().toLocaleString('en-GB', { timeZone: 'America/Toronto' });
        // disabling to allow for the use of 'Content-Type' in train case as camelCase is required by eslint
        // eslint-disable-next-line @typescript-eslint/naming-convention
        return this.httpService.patch(`${this.baseUrl}/game/update/`, gameJson, { headers: { 'Content-Type': 'application/json' } });
    }

    changeVisibility(id: string) {
        // disabling to allow for the use of 'Content-Type' in train case as camelCase is required by eslint
        // eslint-disable-next-line @typescript-eslint/naming-convention
        return this.httpService.patch(`${this.baseUrl}/game/changeVisibility/` + id, {}, { headers: { 'Content-Type': 'application/json' } });
    }
}
