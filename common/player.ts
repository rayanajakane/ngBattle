export interface Player {
    id: string;
    name: string;
    isAdmin: boolean;
    avatar: string;
    attributes: PlayerAttribute;
    isActive: boolean;
    abandoned: boolean;
    wins: number;
}

export interface PlayerAttribute {
    health: string;
    speed: string;
    attack: string;
    defense: string;
    dice: string;
}

export interface PlayerCoord {
    player: Player;
    position: number;
}
