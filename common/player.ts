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
}

export interface PlayerAttribute {
    health: string; // maxHealth
    currentHealth?: string;
    speed: string; // maxSpeed
    currentSpeed?: string;
    attack: number; // maxAttack
    currentAttack?: number;
    defense: number; // maxDefense
    currentDefense?: number;
    dice: string;
    // TO VERIFY
    escape?: number;
}

export interface PlayerCoord {
    player: Player;
    position: number;
}
