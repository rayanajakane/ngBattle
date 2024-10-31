export interface PlayerJson {
    id: string;
    name: string;
    avatar: string;
}

export interface MatchJson {
    players: PlayerJson[];
    gameId: string;
    adminId: string;
    isLocked: boolean;
}
