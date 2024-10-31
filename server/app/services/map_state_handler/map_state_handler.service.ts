import { GameJson } from '@app/model/game-structure';
import { MovementService } from '@app/services/movement/movement.service';
import { Injectable } from '@nestjs/common';

// TODO: declare the Coord interface interface in a separate file and import it here
export interface Coord {
    x: number;
    y: number;
    distance?: number;
    parentNodes?: Coord[];
}

enum TileType {
    Ice = 0,
    Floor = 1,
    DoorOpen = 1,
    Water = 2,
}

@Injectable()
export class MapStateHandlerService {
    constructor(movement: MovementService) {}
    activeGames: GameJson[] = [];
    turn: number = 0;
    game: GameJson;
    activeIndex: number = 0;

    // placeholder for now
    playermoveSpeed = 3;
}
