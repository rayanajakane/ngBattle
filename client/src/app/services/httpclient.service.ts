import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface TileJson {
    i: number;
    j: number;
    tileType: string;
    item: string;
    hasPlayer: boolean;
}

export interface GameJson {
    id: string;
    gameName: string;
    gameDescription: string;
    mapSize: string;
    map: TileJson[];
    gameType: string;
    isVisible: boolean;
}

// TODO: add the opeartions on the instance of data in the client side

@Injectable({
    providedIn: 'root',
})
export class HttpclientService {
    http = this.httpService;
    private readonly baseUrl = 'http://localhost:3000/api';

    constructor(private httpService: HttpClient) {}

    sendGame(gameJson: GameJson) {
        return this.http.post(`${this.baseUrl}/game/upload/`, gameJson, { headers: { 'Content-Type': 'application/json' } });
    }

    getGame(id: string): Observable<GameJson> {
        return this.http.get<GameJson>(`${this.baseUrl}/game/get/` + id);
    }

    getAllGames(): Observable<GameJson[]> {
        return this.http.get<GameJson[]>(`${this.baseUrl}/game/getAll/`);
    }

    deleteGame(id: string) {
        return this.http.delete(`${this.baseUrl}/game/delete/` + id, { headers: { 'Content-Type': 'application/json' } });
    }

    updateGame(gameJson: GameJson) {
        return this.http.patch(`${this.baseUrl}/game/update/`, gameJson, { headers: { 'Content-Type': 'application/json' } });
    }

    changeVisibility(id: string) {
        return this.http.patch(`${this.baseUrl}/game/changeVisibility/` + id, { headers: { 'Content-Type': 'application/json' } });
    }
}
