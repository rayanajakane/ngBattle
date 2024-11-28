export interface Player {
    id: string;
    name: string;
    isAdmin: boolean;
    avatar: string;
    attributes: PlayerAttribute;
    isActive: boolean;
    abandoned: boolean;
    wins: number;
    isVirtual: boolean;
    virtualProfile?: string;
    inventory?: string[];
    homePosition?: number;
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
