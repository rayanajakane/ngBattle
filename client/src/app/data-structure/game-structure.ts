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
    creationDate: string;
}
