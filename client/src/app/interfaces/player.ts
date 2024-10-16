export interface Player {
    id: string;
    name: string;
    isAdmin: boolean;
    avatar: string;
    attributes: PlayerAttribute;
}

export interface PlayerAttribute {
    health: string;
    speed: string;
    attack: string;
    defense: string;
    dice: string;
}
