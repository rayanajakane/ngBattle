import { GlobalStats } from '@common/global-stats';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GlobalStatsService {
    globalStats: GlobalStats;

    visitedIndex?: Set<number>;
    usedDoors?: Set<number>;

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
        this.maxNbDoors = maxNbDoors;
        this.maxNbTiles = maxNbTiles;
        this.visitedIndex = new Set<number>();
        this.usedDoors = new Set<number>();
    }

    incrementTurn(): void {
        this.globalStats.nbTurns++;
    }

    addVisitedTile(tileIndex: number): void {
        if (this.visitedIndex.has(tileIndex)) {
            this.visitedIndex.add(tileIndex);
        }
    }

    //TODO: call the function to get percent at the end of the game
    getVisitedPercent(): number {
        return (this.visitedIndex.size / this.maxNbTiles) * 100;
    }

    addUsedDoor(doorIndex: number): void {
        if (this.usedDoors.has(doorIndex)) {
            this.usedDoors.add(doorIndex);
        }
    }

    //TODO: call the function to get percent at the end of the game
    getUsedDoorsPercent(): number {
        return (this.usedDoors.size / this.maxNbDoors) * 100;
    }

    //TODO: call the function to get the final stats at the end of the game
    getFinalStats(): GlobalStats {
        this.globalStats.visitedTilesPercent = this.getVisitedPercent();
        this.globalStats.usedDoorsPercent = this.getUsedDoorsPercent();
        this.stopTimerInterval();
        return this.globalStats;
    }

    //TODO: add the functions to update the stats when a player holds the flag
}
