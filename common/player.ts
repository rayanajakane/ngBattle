export interface Player {
    id: string;
    name: string;
    isAdmin: boolean;
    avatar: string;
    attributes: PlayerAttribute;
    isActive: boolean;
    abandoned: boolean;
    wins: number;
    stats: PlayerStats;
}

export interface PlayerAttribute {
    health: string;
    speed: string;
    attack: string;
    defense: string;
    dice: string;
}

export interface PlayerStats {
    combatCount: number;
    escapeCount: number;
    victoryCount: number;
    defeatCount: number;
    totalHealthLost: number;
    totalHealthTaken: number;
    uniqueItemsCollected: number;
    visitedTilesPercent: number;
}
