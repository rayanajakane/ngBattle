// Constants for starting point amount validation
export const SMALL_MAP_SIZE = 10;
export const MEDIUM_MAP_SIZE = 15;
export const LARGE_MAP_SIZE = 20;
export const SMALL_STARTING_POINTS = 2;
export const MEDIUM_STARTING_POINTS = 4;
export const LARGE_STARTING_POINTS = 6;

// Constants for tile type checks
export const TERRAIN_TILES = ['', 'grass', 'water', 'ice'];
export const DOOR_TILES = ['doorClosed', 'doorOpen'];
export const TERRAIN_DOOR_TILES = TERRAIN_TILES.concat(DOOR_TILES);
