import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

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
    constructor(private httpService: HttpClient) {}

    private readonly BASE_URL = 'http://localhost:3000/api';
    http = this.httpService;

    sendGame(gameJson: GameJson) {
        return this.http.post(`${this.BASE_URL}/game/upload/`, gameJson, { headers: { 'Content-Type': 'application/json' } })
    }

    getGame(id: string) {
        return this.http.get(`${this.BASE_URL}/game/get/` + id);
    }

    getAllGames() {
        return this.http.get(`${this.BASE_URL}/game/getAll/`);
    }

    deleteGame(id: string) {
        return this.http.delete(`${this.BASE_URL}game/delete/` + id);
    }

    updateGame(gameJson: GameJson) {
        return this.http.patch(`${this.BASE_URL}/game/update/`, gameJson, { headers: { 'Content-Type': 'application/json' } });
    }
}
