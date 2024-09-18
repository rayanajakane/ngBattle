import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GameJson } from '@app/data-structure/game-structure';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class HttpclientService {
    private readonly baseUrl = 'http://localhost:3000/api';

    constructor(private httpService: HttpClient) {}

    sendGame(gameJson: GameJson) {
        // TODO: Fix 'Content-Type' linting error'
        // eslint-disable-next-line @typescript-eslint/naming-convention
        return this.httpService.post(`${this.baseUrl}/game/upload/`, gameJson, { headers: { 'Content-Type': 'application/json' } });
    }

    getGame(id: string): Observable<GameJson> {
        return this.httpService.get<GameJson>(`${this.baseUrl}/game/get/` + id);
    }

    getAllGames(): Observable<GameJson[]> {
        return this.httpService.get<GameJson[]>(`${this.baseUrl}/game/getAll/`);
    }

    deleteGame(id: string) {
        return this.httpService.delete(`${this.baseUrl}/game/delete/` + id, { headers: { 'Content-Type': 'application/json' } });
    }

    updateGame(gameJson: GameJson) {
        // TODO: Fix 'Content-Type' linting error'
        // eslint-disable-next-line @typescript-eslint/naming-convention
        return this.httpService.patch(`${this.baseUrl}/game/update/`, gameJson, { headers: { 'Content-Type': 'application/json' } });
    }

    changeVisibility(id: string) {
        return this.httpService.patch(`${this.baseUrl}/game/changeVisibility/` + id, { headers: { 'Content-Type': 'application/json' } });
    }
}
