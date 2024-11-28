import { GameStructure } from '@common/game-structure';
import { Player, PlayerAttribute } from '@common/player';

/* eslint-disable */
export const DEFAULT_STARTING_POINT_NUMBER = 5;
export const DEFAULT_MAP_SIZE_SMALL = 10;
export const DEFAULT_MAP_SIZE_MEDIUM = 15;
export const DEFAULT_STARTING_COUNTER_TWO = 2;
export const DEFAULT_STARTING_COUNTER_FOUR = 4;
export const DEFAULT_STARTING_COUNTER_SIX = 6;
export const DEFAULT_STARTING_COUNTER_ONE = 1;

export const TEST_AVAILABLE_TILES = [1, 2, 3];
export const RANDOM_TILE_INDEX = 4;
export const TEST_SHORTEST_PATH = { 1: [2, 3] };
export const TEST_SHORTEST_PATH_BY_INDEX = { 1: [2, 3], 2: [3, 4] };

export const TEST_MOVE_BUDGET = 6;

export const MOCK_PLAYER: Player = {
    id: '1',
    name: 'player1',
    isAdmin: false,
    avatar: '1',
    attributes: {} as PlayerAttribute,
    isActive: false,
    abandoned: false,
    wins: 0,
    inventory: [],
};

export const MOCK_PLAYER_TWO: Player = {
    id: '2',
    name: 'player2',
    isAdmin: false,
    avatar: '2',
    attributes: {} as PlayerAttribute,
    isActive: false,
    abandoned: false,
    wins: 0,
    inventory: [],
};

export const MOCK_PLAYER_COORD = { player: MOCK_PLAYER, position: 1 };
export const MOCK_PLAYER_TWO_COORD = { player: MOCK_PLAYER_TWO, position: 2 };

export const MOCK_PLAYER_COORDS = [MOCK_PLAYER_COORD, MOCK_PLAYER_TWO_COORD];
export const MOCKGAME: GameStructure = {
    id: 'testGame',
    gameName: 'Test Game',
    gameDescription: 'This is a test game',
    mapSize: '10',
    map: [],
    gameType: 'Test Type',
    isVisible: true,
    creationDate: new Date().toISOString(),
    lastModified: new Date().toISOString(),
};
