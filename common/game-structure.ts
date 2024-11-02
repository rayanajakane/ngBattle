export interface TileStructure {
    idx: number;
    tileType: string;
    item: string;
    hasPlayer: boolean;
}

export interface GameStructure {
    id: string;
    gameName: string;
    gameDescription: string;
    mapSize: string;
    map: TileStructure[];
    gameType: string;
    isVisible: boolean;
    creationDate: string;
    lastModified: string;
}
