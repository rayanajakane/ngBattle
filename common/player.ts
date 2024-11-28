import { ItemTypes } from '@common/tile-types';

export interface Player {
    id: string;
    name: string;
    isAdmin: boolean;
    avatar: string;
    attributes: PlayerAttribute;
    isActive: boolean;
    abandoned: boolean;
    wins: number;
    inventory: ItemTypes[];
    homePosition?: number;
}

export interface PlayerAttribute {
    health: number; // maxHealth
    currentHealth?: number;
    speed: number; // maxSpeed
    currentSpeed?: number;
    attack: number; // maxAttack
    currentAttack?: number;
    defense: number; // maxDefense
    currentDefense?: number;
    dice: string;
    escape?: number;
    isCombatBoostedAttack?: boolean;
    isCombatBoostedDefense?: boolean;
}

export interface PlayerCoord {
    player: Player;
    position: number;
}
