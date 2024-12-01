import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Player } from '@common/player';

@Component({
    selector: 'app-player-stats',
    standalone: true,
    imports: [MatTableModule, MatSortModule],
    templateUrl: './player-stats.component.html',
    styleUrl: './player-stats.component.scss',
})
export class PlayerStatsComponent implements OnInit {
    @Input() playerList: Player[] = [];
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatTable) table: MatTable<any>;

    adaptedPlayerList: {
        name: string;
        combatCount: number;
        escapeCount: number;
        victoryCount: number;
        defeatCount: number;
        totalHealthLost: number;
        totalHealthTaken: number;
        uniqueItemsCollected: number;
        visitedTilesPercent: number;
    }[] = [];

    dataSource = new MatTableDataSource<{
        name: string;
        combatCount: number;
        escapeCount: number;
        victoryCount: number;
        defeatCount: number;
        totalHealthLost: number;
        totalHealthTaken: number;
        uniqueItemsCollected: number;
        visitedTilesPercent: number;
    }>([]);

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

    // playerList: Player[] = [
    //     {
    //         id: '1',
    //         name: 'Alice',
    //         isAdmin: true,
    //         avatar: 'avatar1.png',
    //         attributes: {
    //             health: '100',
    //             speed: '10',
    //             attack: '15',
    //             defense: '5',
    //             dice: 'd6',
    //         },
    //         isActive: true,
    //         abandoned: false,
    //         wins: 10,
    //         stats: {
    //             combatCount: 20,
    //             escapeCount: 5,
    //             victoryCount: 10,
    //             defeatCount: 10,
    //             totalHealthLost: 200,
    //             totalHealthTaken: 300,
    //             uniqueItemsCollected: 15,
    //             visitedTilesPercent: 75,
    //         },
    //     },
    //     {
    //         id: '2',
    //         name: 'Bob',
    //         isAdmin: false,
    //         avatar: 'avatar2.png',
    //         attributes: {
    //             health: '90',
    //             speed: '12',
    //             attack: '10',
    //             defense: '8',
    //             dice: 'd8',
    //         },
    //         isActive: false,
    //         abandoned: true,
    //         wins: 5,
    //         stats: {
    //             combatCount: 15,
    //             escapeCount: 3,
    //             victoryCount: 5,
    //             defeatCount: 10,
    //             totalHealthLost: 150,
    //             totalHealthTaken: 200,
    //             uniqueItemsCollected: 10,
    //             visitedTilesPercent: 60,
    //         },
    //     },
    //     {
    //         id: '3',
    //         name: 'Charlie',
    //         isAdmin: false,
    //         avatar: 'avatar3.png',
    //         attributes: {
    //             health: '110',
    //             speed: '8',
    //             attack: '20',
    //             defense: '10',
    //             dice: 'd10',
    //         },
    //         isActive: true,
    //         abandoned: false,
    //         wins: 15,
    //         stats: {
    //             combatCount: 25,
    //             escapeCount: 2,
    //             victoryCount: 15,
    //             defeatCount: 10,
    //             totalHealthLost: 250,
    //             totalHealthTaken: 350,
    //             uniqueItemsCollected: 20,
    //             visitedTilesPercent: 80,
    //         },
    //     },
    // ];

    constructor() {
        //this.table.renderRows();
    }

    ngOnInit(): void {
        console.log('Players:', this.playerList);
        this.adaptedPlayerList = this.playerList.map((player) => {
            console.log('Player:', player.stats);
            const playerCopy = JSON.parse(JSON.stringify(player));
            return {
                name: playerCopy.name,
                combatCount: playerCopy.stats.combatCount,
                escapeCount: playerCopy.stats.escapeCount,
                victoryCount: playerCopy.stats.victoryCount,
                defeatCount: playerCopy.stats.defeatCount,
                totalHealthLost: playerCopy.stats.totalHealthLost,
                totalHealthTaken: playerCopy.stats.totalHealthTaken,
                uniqueItemsCollected: playerCopy.stats.uniqueItemsCollected,
                visitedTilesPercent: playerCopy.stats.visitedTilesPercent,
            };
        });
        console.log('Adapted Players:', this.adaptedPlayerList);
        this.dataSource = new MatTableDataSource(this.adaptedPlayerList);
    }

    ngAfterViewInit() {
        // console.log('Players:', this.playerList);
        // this.adaptedPlayerList = this.playerList.map((player) => {
        //     console.log('Player:', player.stats);
        //     return {
        //         name: player.name,
        //         combatCount: player.stats.combatCount,
        //         escapeCount: player.stats.escapeCount,
        //         victoryCount: player.stats.victoryCount,
        //         defeatCount: player.stats.defeatCount,
        //         totalHealthLost: player.stats.totalHealthLost,
        //         totalHealthTaken: player.stats.totalHealthTaken,
        //         uniqueItemsCollected: player.stats.uniqueItemsCollected,
        //         visitedTilesPercent: player.stats.visitedTilesPercent,
        //     };
        // });
        // console.log('Adapted Players:', this.adaptedPlayerList);
        // this.dataSource = new MatTableDataSource(this.adaptedPlayerList);
        this.dataSource.sort = this.sort;
    }
}
