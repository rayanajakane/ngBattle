export interface TileStructure {
export enum TilePreview {
    NONE,
    PREVIEW,
}
    SHORTESTPATH,
import { Player } from '@app/interfaces/player';
    idx: number;
    tileType: string;
    item: string;
    hasPlayer: boolean;
}

export interface GameTile extends TileJson {
    isAccessible: TilePreview;
    player: Player | undefined;
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
