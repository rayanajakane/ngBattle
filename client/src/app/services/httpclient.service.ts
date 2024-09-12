import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type Game = {};

// TODO: add the opeartions on the instance of data in the client side

@Injectable({
    providedIn: 'root',
})
export class HttpclientService {
    constructor(private httpService: HttpClient) {}

    readonly baseUrl = 'http://localhost:3000/api';
    http = this.httpService;

    sendGame(game: Game) {
        // TODO: check if this is the right way to define the type of the parameter
        return this.http.post(`${this.baseUrl}/game`, JSON.stringify(game), { headers: { 'Content-Type': 'application/json' } });
    }

    getGame(id: string): Observable<Game> {
        return this.http.get(`${this.baseUrl}/game/` + id).pipe(map((response) => response as Game));
    }

    getGames(): Observable<Game[]> {
        return this.http.get(`${this.baseUrl}/games`).pipe(map((response) => response as Game[]));
    }

    deleteGame(id: string) {
        return this.http.delete(`${this.baseUrl}game/` + id);
    }

    updateGame(game: Game) {
        return this.http.put(`${this.baseUrl}/game`, JSON.stringify(game), { headers: { 'Content-Type': 'application/json' } });
    }
}
