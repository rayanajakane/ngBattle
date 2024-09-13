import { GameMode } from '@app/data-structure/enum/game-mode-enum';
import { SizeMap } from '@app/data-structure/enum/size-map-enum';
import { Tile } from '@app/data-structure/game-structure/tile-structure';

export type Game = {
    id?: number;
    name?: string;
    description?: string;
    size?: SizeMap;
    mode?: GameMode;
    lastModified?: string;
    isVisible?: boolean;
    map?: Tile[][];
};
