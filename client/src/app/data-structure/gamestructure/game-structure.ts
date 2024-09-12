import { GameMode } from '@app/data-structure/enum/game-mode-enum';
import { SizeMap } from '@app/data-structure/enum/size-map-enum';
import { Block } from '@app/data-structure/game-structure/block-structure';

export type Game = {
    id: number;
    name: string;
    description: string;
    gameSize: SizeMap;
    gameMode: GameMode;
    maxPlayers: number;
    map: Block[][];
};
