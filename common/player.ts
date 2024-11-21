export interface Player {
    id: string;
    name: string;
    isAdmin: boolean;
    avatar: string;
    attributes: PlayerAttribute;
    isActive: boolean;
    abandoned: boolean;
    wins: number;
    inventory?: string[];
    homePosition?: number;
    stats: PlayerStats;
}

export interface PlayerAttribute {
    health: number; // maxHealth
    currentHealth?: number;
    speed: string; // maxSpeed
    currentSpeed?: string;
    attack: number; // maxAttack
    currentAttack?: number;
    defense: number; // maxDefense
    currentDefense?: number;
    dice: string;
    escape?: number;
}

export interface PlayerCoord {
    player: Player;
    position: number;
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
