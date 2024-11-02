export interface Tile {
    idx: number;
    tileType: string;
    item: string;
    hasPlayer: boolean;
}
// TODO: rename 'gameName' to just 'name'
export interface Game {
    id: string;
    gameName: string;
    gameDescription: string;
    mapSize: string;
    map: Tile[];
    gameType: string;
    isVisible: boolean;
    creationDate: string;
    lastModified: string;
}
