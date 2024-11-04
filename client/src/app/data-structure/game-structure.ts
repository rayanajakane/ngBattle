import { Player } from '@app/interfaces/player';

export enum TilePreview {
    NONE,
    PREVIEW,
    SHORTESTPATH,
}

export interface TileJson {
    idx: number;
    tileType: string;
    item: string;
    hasPlayer: boolean;
}

export interface GameTile extends TileJson {
    isAccessible: TilePreview;
    player: Player | undefined;
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
    lastModified: string;
}
