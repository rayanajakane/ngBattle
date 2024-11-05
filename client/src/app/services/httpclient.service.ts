import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Game } from '@app/data-structure/game-structure';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment.prod';
@Injectable({
    providedIn: 'root',
})
export class HttpClientService {
    private readonly BASE_URL = environment.serverUrl + '/api';

    constructor(private readonly httpService: HttpClient) {}

    async gameExists(id: string): Promise<boolean> {
        return (await this.getGame(id)) !== null;
    }

    sendGame(gameJson: Game) {
        gameJson.creationDate = new Date().toISOString();
        gameJson.lastModified = new Date().toLocaleString('en-GB', { timeZone: 'America/Toronto' });
        // eslint-disable-next-line @typescript-eslint/naming-convention
        return this.httpService.post(`${this.BASE_URL}/game/upload/`, gameJson, { headers: { 'Content-Type': 'application/json' } });
    }

    async getGame(id: string): Promise<Game> {
        return await firstValueFrom(this.httpService.get<Game>(`${this.BASE_URL}/game/get/` + id));
    }

    async getAllGames(): Promise<Game[]> {
        return await firstValueFrom(
            this.httpService
                .get<Game[]>(`${this.BASE_URL}/game/getAll/`)
                .pipe(map((games: Game[]) => games.sort((a, b) => new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime()))),
        );
    }

    deleteGame(id: string) {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        return this.httpService.delete(`${this.BASE_URL}/game/delete/` + id, { headers: { 'Content-Type': 'application/json' } });
    }

    updateGame(gameJson: Game) {
        gameJson.lastModified = new Date().toLocaleString('en-GB', { timeZone: 'America/Toronto' });
        // eslint-disable-next-line @typescript-eslint/naming-convention
        return this.httpService.patch(`${this.BASE_URL}/game/update/`, gameJson, { headers: { 'Content-Type': 'application/json' } });
    }

    changeVisibility(id: string) {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        return this.httpService.patch(`${this.BASE_URL}/game/changeVisibility/` + id, {}, { headers: { 'Content-Type': 'application/json' } });
    }
}
