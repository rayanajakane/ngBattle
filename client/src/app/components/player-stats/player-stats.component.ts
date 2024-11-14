import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { Player } from '@common/player';

enum SortState {
    NONE,
    ASCENDING,
    DESCENDING,
}

@Component({
    selector: 'app-player-stats',
    standalone: true,
    imports: [MatTableModule],
    templateUrl: './player-stats.component.html',
    styleUrl: './player-stats.component.scss',
})
export class PlayerStatsComponent {
    // @Input() playerList: Player[];

    sortStates: Map<string, SortState> = new Map<string, SortState>();

    columnsToDisplay: string[] = [
        'name',
        'combatCount',
        'escapeCount',
        'victoryCount',
        'defeatCount',
        'totalHealthLost',
        'totalHealthTaken',
        'uniqueItemsCollected',
        'visitedTilesPercent',
    ];

    dataSource: Player[] = [
        {
            id: '1',
            name: 'Alice',
            isAdmin: true,
            avatar: 'avatar1.png',
            attributes: {
                health: '100',
                speed: '10',
                attack: '15',
                defense: '5',
                dice: 'd6',
            },
            isActive: true,
            abandoned: false,
            wins: 10,
            stats: {
                combatCount: 20,
                escapeCount: 5,
                victoryCount: 10,
                defeatCount: 10,
                totalHealthLost: 200,
                totalHealthTaken: 300,
                uniqueItemsCollected: 15,
                visitedTilesPercent: 75,
            },
        },
        {
            id: '2',
            name: 'Bob',
            isAdmin: false,
            avatar: 'avatar2.png',
            attributes: {
                health: '90',
                speed: '12',
                attack: '10',
                defense: '8',
                dice: 'd8',
            },
            isActive: false,
            abandoned: true,
            wins: 5,
            stats: {
                combatCount: 15,
                escapeCount: 3,
                victoryCount: 5,
                defeatCount: 10,
                totalHealthLost: 150,
                totalHealthTaken: 200,
                uniqueItemsCollected: 10,
                visitedTilesPercent: 60,
            },
        },
        {
            id: '3',
            name: 'Charlie',
            isAdmin: false,
            avatar: 'avatar3.png',
            attributes: {
                health: '110',
                speed: '8',
                attack: '20',
                defense: '10',
                dice: 'd10',
            },
            isActive: true,
            abandoned: false,
            wins: 15,
            stats: {
                combatCount: 25,
                escapeCount: 2,
                victoryCount: 15,
                defeatCount: 10,
                totalHealthLost: 250,
                totalHealthTaken: 350,
                uniqueItemsCollected: 20,
                visitedTilesPercent: 80,
            },
        },
    ];

    constructor() {
        this.sortStates = new Map(this.columnsToDisplay.map((column) => [column, SortState.None]));
    }

    changeState(event: Event) {
        const target = event.target as HTMLElement;
        const key = target.getAttribute('value') || 'name';
        const valueState = this.sortStates.get(key);

        switch (valueState) {
            case SortState.NONE:
                this.sortStates.set(key, SortState.ASCENDING);
                break;
            case SortState.ASCENDING:
                this.sortStates.set(key, SortState.DESCENDING);
                break;
            case SortState.DESCENDING:
                this.sortStates.set(key, SortState.ASCENDING);
                break;
            default:
                this.sortStates.set(key, SortState.NONE);
                break;
        }

        this.setOtherStatesToNone(key);
    }

    setOtherStatesToNone(modifiedKey: string) {
        this.sortStates.forEach((state, key) => {
            if (key !== modifiedKey) {
                this.sortStates.set(key, SortState.NONE);
            }
        });
    }

    sortByName() {
        console.log('sortByName');
    }
}
