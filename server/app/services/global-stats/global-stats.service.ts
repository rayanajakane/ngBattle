import { GlobalStats } from '@common/global-stats';
import { Player } from '@common/player';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GlobalStatsService {
    globalStats: GlobalStats;

    visitedIndex: Set<number> = new Set<number>();
    usedDoors: Set<number> = new Set<number>();

    playerHeldFlag: Set<Player> = new Set<Player>();

    maxNbDoors: number;
    maxNbTiles: number;

    timerId: NodeJS.Timeout;

    startTimerInterval(): void {
        this.timerId = setInterval(() => {
            this.globalStats.matchLength++;
        }, 1000);
    }

    stopTimerInterval(): void {
        clearInterval(this.timerId);
    }

    constructor(maxNbDoors: number, maxNbTiles: number) {
        this.globalStats = {
            matchLength: 0,
            nbTurns: 0,
            visitedTilesPercent: 0,
            usedDoorsPercent: 0,
            nbPlayersHeldFlag: 0,
        };
        this.maxNbDoors = maxNbDoors;
        this.maxNbTiles = maxNbTiles;
        this.visitedIndex = new Set<number>();
        this.usedDoors = new Set<number>();
    }

    incrementTurn(): void {
        this.globalStats.nbTurns++;
    }

    addVisitedTile(tileIndex: number): void {
        this.visitedIndex.add(tileIndex);
    }

    // TODO: call the function to get percent at the end of the game
    getVisitedPercent(): number {
        return (this.visitedIndex.size / this.maxNbTiles) * 100;
    }

    addUsedDoor(doorIndex: number): void {
        this.usedDoors.add(doorIndex);
    }

    addPlayerHeldFlag(player: Player): void {
        this.playerHeldFlag.add(player);
        this.globalStats.nbPlayersHeldFlag = this.playerHeldFlag.size;
    }

    // TODO: call the function to get percent at the end of the game
    getUsedDoorsPercent(): number {
        return (this.usedDoors.size / this.maxNbDoors) * 100;
    }

    // TODO: call the function to get the final stats at the end of the game
    getFinalStats(): GlobalStats {
        this.globalStats.visitedTilesPercent = this.getVisitedPercent();
        this.globalStats.usedDoorsPercent = this.getUsedDoorsPercent();
        this.stopTimerInterval();
        return this.globalStats;
    }

    // TODO: add the functions to update the stats when a player holds the flag
}
