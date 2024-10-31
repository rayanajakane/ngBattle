import { GameJson } from '@app/model/game-structure';
import { GameService } from '@app/services/game.service';
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
    constructor(
        movement: MovementService,
        private gameService: GameService,
    ) {}
    activeGames: GameJson[] = [];
    turn: number = 0;
    game: GameJson;
    activeIndex: number = 0;

    // placeholder for now
    playermoveSpeed = 3;

    async checkGameInstance(gameId: string): Promise<void> {
        if (this.activeGames.find((game) => game.id === gameId) === undefined) {
            const fetchedGame: GameJson = await this.gameService.get(gameId).then((game) => game);
            this.activeGames.push(fetchedGame);
        }
    }

    // movePlayer(gameId: string, playerId: string, direction: string): number[] {
    //     //TODO: remove autistic console.log
    //     this.checkGameInstance(gameId).then(() => {console.log('idk bruh')

    //     this.game = this.activeGames.find((game) => game.id === gameId) as GameJson;
    //     const player = this.game.players.find((player) => player.id === playerId);
    //     const playerCoord: Coord = player.coord;
    //     }
    // );

    // }
}
