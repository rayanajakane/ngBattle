export interface TileJson {
    idx: number;
    tileType: string;
    item: string;
    hasPlayer: boolean;
}
// TODO: rename 'gameName' to just 'name'
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
