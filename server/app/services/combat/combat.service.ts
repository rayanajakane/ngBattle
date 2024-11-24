import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { CombatTimerService } from '@app/services/combat-timer/combat-timer.service';
import {
    ATTACKER_INDEX,
    BOOSTED_BONUS_DICE,
    COMBAT_FIGHTERS_NUMBER,
    DEFAULT_BONUS_DICE,
    DEFAULT_ESCAPE_TOKENS,
    DEFENDER_INDEX,
    ESCAPE_PROBABILITY,
    FIRST_INVENTORY_SLOT,
    ICE_PENALTY,
    LEFT_TILE,
    RIGHT_TILE,
    SECOND_INVENTORY_SLOT,
    SUCCESSFUL_ATTACK_DAMAGE,
} from '@app/services/combat/constants';
import { CombatAction } from '@common/combat-actions';
import { PlayerAttribute, PlayerCoord } from '@common/player';
import { TileTypes } from '@common/tile-types';
import { Inject, Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { ActionHandlerService } from '../action-handler/action-handler.service';
@Injectable()
export class CombatService {
    fightersMap: Map<string, PlayerCoord[]> = new Map(); // room id and fighters
    private currentTurnMap: Map<string, number> = new Map(); // Track current turn index by roomId
    private combatTimerMap: Map<string, CombatTimerService> = new Map(); // Track current timer by roomId
    constructor(
        @Inject(ActiveGamesService) private readonly activeGamesService: ActiveGamesService,
        @Inject(ActionHandlerService) private readonly actionHandlerService: ActionHandlerService,
    ) {}

    // You can also replace this.currentTurnMap.set(roomId, index)
    // with a setPlayerTurn method with more verification
    isPlayerInCombat(roomId: string, player: PlayerCoord): boolean {
        const fighters = this.fightersMap.get(roomId);
        return fighters ? fighters.some((fighter) => fighter.player.id === player.player.id) : false;
    }

    getFighters(roomId: string): PlayerCoord[] {
        return this.fightersMap.get(roomId);
    }

    startCombat(roomId: string, fighters: PlayerCoord[]): PlayerCoord[] {
        const gameInstance = this.activeGamesService.getActiveGame(roomId);
        gameInstance.turnTimer.pauseTimer();

        if (fighters.length === COMBAT_FIGHTERS_NUMBER) {
            // setup current attributes for each player in combat
            fighters.forEach((fighter) => {
                if (fighter.player.attributes.currentHealth === undefined) {
                    fighter.player.attributes.currentHealth = fighter.player.attributes.health;
                }
                if (fighter.player.attributes.currentAttack === undefined) {
                    fighter.player.attributes.currentAttack = fighter.player.attributes.attack;
                }
                if (fighter.player.attributes.currentDefense === undefined) {
                    fighter.player.attributes.currentDefense = fighter.player.attributes.defense;
                }
                if (fighter.player.attributes.currentSpeed === undefined) {
                    fighter.player.attributes.currentSpeed = fighter.player.attributes.speed;
                }
                // verifies if player is on ice
                this.applyIceDisadvantage(roomId, fighter);
            });

            this.fightersMap.set(roomId, fighters);
            this.setEscapeTokens(roomId);
            gameInstance.combatTimer.startTimer(true);

            // Initialize turn to first player
            const firstPlayer = this.whoIsFirstPlayer(roomId);
            const secondPlayer = fighters.find((f) => f.player.id !== firstPlayer.player.id);

            const firstPlayerIndex = fighters.findIndex((f) => f.player.id === firstPlayer.player.id);
            this.currentTurnMap.set(roomId, firstPlayerIndex);
            return [firstPlayer, secondPlayer];
        }
    }

    endCombat(roomId: string, server: Server, player?: PlayerCoord): PlayerCoord[] {
        // inc wins if a player leaves game
        const gameInstance = this.activeGamesService.getActiveGame(roomId);
        gameInstance.combatTimer.resetTimer();

        const fighters = this.fightersMap.get(roomId);
        if (fighters.length !== 0) {
            // reset health no matter how combat ended
            fighters.forEach((fighter) => {
                this.resetHealth(fighter);
            });
        }
        this.fightersMap.delete(roomId);
        this.currentTurnMap.delete(roomId);

        if (player.player.wins === 3) {
            let playersLeft = '';
            gameInstance.playersCoord.forEach((p) => {
                playersLeft = playersLeft.concat(`${p.player.name} `);
            });
            playersLeft = playersLeft.concat('.');
            const logMessage = `Partie terminée: ${player.player.name} a gagné la partie. Joueurs restants: ${playersLeft}`;
            const formattedTime = this.actionHandlerService.getCurrentTimeFormatted();
            server.to(roomId).emit('newLog', { date: formattedTime, message: logMessage });

            server.to(roomId).emit('endGame', `${player.player.name} a gagné la partie`);
            this.activeGamesService.removeGameInstance(roomId);
            return;
        }

        gameInstance.turnTimer.resumeTimer();
        server.to(roomId).emit('endCombat', fighters);

        return fighters;
    }

    whoIsFirstPlayer(roomId: string): PlayerCoord {
        const currentFighters = this.fightersMap.get(roomId);
        return currentFighters[ATTACKER_INDEX].player.attributes.speed >= currentFighters[DEFENDER_INDEX].player.attributes.speed
            ? currentFighters[ATTACKER_INDEX]
            : currentFighters[DEFENDER_INDEX];
    }

    applyIceDisadvantage(roomId: string, player: PlayerCoord): void {
        if (this.isPlayerOnIce(roomId, player)) {
            // verify if attributes are > 0
            player.player.attributes.currentAttack -= ICE_PENALTY;
            player.player.attributes.currentDefense -= ICE_PENALTY;
            console.log('ice penalty', player.player.attributes.currentAttack, player.player.attributes.currentDefense);
        }
    }

    setEscapeTokens(roomId: string): void {
        if (this.fightersMap.get(roomId).length === COMBAT_FIGHTERS_NUMBER) {
            this.fightersMap.get(roomId).forEach((fighter) => {
                fighter.player.attributes.escape = DEFAULT_ESCAPE_TOKENS;
            });
        }
    }

    escape(roomId: string, player: PlayerCoord, server: Server): [PlayerAttribute['escape'], boolean] {
        // only the player's turn can escape
        if (this.getCurrentTurnPlayer(roomId)?.player.id !== player.player.id || player.player.attributes.escape < 1) {
            return [player.player.attributes.escape, false];
        }
        const canPlayerEscape = this.canPlayerEscape(roomId, player);
        if (this.isPlayerInCombat(roomId, player) && !canPlayerEscape) {
            player.player.attributes.escape--;
            this.endCombatTurn(roomId, player, server);
            return [player.player.attributes.escape, false];
        } else if (this.isPlayerInCombat(roomId, player) && canPlayerEscape) {
            player.player.attributes.escape--;
            return [player.player.attributes.escape, true];
        }
    }

    setWinner(roomId: string, player: PlayerCoord): void {
        if (this.isPlayerInCombat(roomId, player)) player.player.wins++;
    }

    startCombatTurn(roomId: string, player: PlayerCoord): void {
        const gameInstance = this.activeGamesService.getActiveGame(roomId);
        const hasEscape = player.player.attributes.escape > 0;
        gameInstance.combatTimer.startTimer(hasEscape);

        const currentPlayerTurnIndex = this.fightersMap.get(roomId).findIndex((fighter) => fighter.player.id === player.player.id);
        this.currentTurnMap.set(roomId, currentPlayerTurnIndex);
    }

    startCombatAction(roomId: string, player: PlayerCoord, combatAction: CombatAction, server: Server): void {
        if (combatAction === CombatAction.ATTACK) {
            const defender = this.fightersMap.get(roomId).find((fighter) => fighter.player.id !== player.player.id);
            this.attack(roomId, player, defender, server);
        } else if (combatAction === CombatAction.ESCAPE) {
            this.escape(roomId, player, server);
        }
    }

    endCombatTurn(roomId: string, player: PlayerCoord, server: Server): void {
        const gameInstance = this.activeGamesService.getActiveGame(roomId);
        gameInstance.combatTimer.resetTimer();

        if (!this.isPlayerInCombat(roomId, player)) return;
        const currentTurnIndex = this.currentTurnMap.get(roomId);

        const newTurnIndex = (currentTurnIndex + 1) % COMBAT_FIGHTERS_NUMBER;
        this.currentTurnMap.set(roomId, newTurnIndex);
    }

    getCurrentTurnPlayer(roomId: string): PlayerCoord | undefined {
        const fighters = this.fightersMap.get(roomId);
        const currentTurnIndex = this.currentTurnMap.get(roomId) || ATTACKER_INDEX;
        return fighters?.[currentTurnIndex];
    }

    checkAttackSuccessful(attacker: PlayerCoord, defender: PlayerCoord): [boolean, number[]] {
        let bonusAttackDice: number = DEFAULT_BONUS_DICE;
        let bonusDefenseDice: number = DEFAULT_BONUS_DICE;
        if (attacker.player.attributes.dice === 'attack') bonusAttackDice = BOOSTED_BONUS_DICE;
        else if (defender.player.attributes.dice === 'defense') bonusDefenseDice = BOOSTED_BONUS_DICE;
        const attackerRoll = this.throwDice(bonusAttackDice);
        const defenderRoll = this.throwDice(bonusDefenseDice);
        const isAttackSuccessful = attacker.player.attributes.currentAttack + attackerRoll > defender.player.attributes.currentDefense + defenderRoll;
        return [isAttackSuccessful, [attackerRoll, defenderRoll]];
    }

    attack(roomId: string, attackPlayer: PlayerCoord, defensePlayer: PlayerCoord, server: Server): [number, number, string, PlayerCoord, boolean] {
        if (this.isPlayerInCombat(roomId, attackPlayer) && this.isPlayerInCombat(roomId, defensePlayer)) {
            const checkAttack = this.checkAttackSuccessful(attackPlayer, defensePlayer);
            if (checkAttack[0]) {
                defensePlayer.player.attributes.currentHealth -= SUCCESSFUL_ATTACK_DAMAGE;
                if (defensePlayer.player.attributes.currentHealth <= 0) {
                    const killedPlayerOldPosition = defensePlayer.position;
                    const [playerKiller, playerKilled, fighters] = this.killPlayer(roomId, defensePlayer, server);

                    // log message
                    const formattedTime = this.actionHandlerService.getCurrentTimeFormatted();
                    const message = `Fin du combat: ${playerKiller.player.name} a tué ${playerKilled.player.name}`;
                    server
                        .to(roomId)
                        .emit('newLog', { date: formattedTime, message: message, sender: playerKiller.player.id, receiver: playerKilled.player.id });

                    return [checkAttack[1][0], checkAttack[1][1], 'combatEnd', defensePlayer, checkAttack[0]];
                }
            }
            console.log('dices', checkAttack[1][0], checkAttack[1][1]);
            this.endCombatTurn(roomId, attackPlayer, server);
            return [checkAttack[1][0], checkAttack[1][1], 'combatTurnEnd', defensePlayer, checkAttack[0]];
        }
        return [-1, -1, 'playerNotInCombat', defensePlayer, false];
    }

    resetAllAttributes(roomId: string, fighter: PlayerCoord): void {
        if (this.isPlayerInCombat(roomId, fighter)) {
            this.resetHealth(fighter);
            this.resetAttack(fighter);
            this.resetDefense(fighter);
            this.resetSpeed(fighter);
        }
    }

    killPlayer(roomId: string, player: PlayerCoord, server: Server): [PlayerCoord, PlayerCoord, PlayerCoord[]] {
        const playerKilled: PlayerCoord = player;
        const playerKiller: PlayerCoord = this.fightersMap.get(roomId).find((fighter) => fighter.player.id !== player.player.id);
        const killedOldPosition = playerKilled.position;
        if (playerKiller && playerKilled) {
            this.setWinner(roomId, playerKiller);
            //this.disperseKilledPlayerObjects(roomId, playerKilled);
            this.resetAllAttributes(roomId, playerKilled);
            this.teleportPlayerToHome(roomId, playerKilled);
            this.resetAllAttributes(roomId, playerKiller);
            server.to(roomId).emit('killedPlayer', {
                killer: playerKiller,
                killed: playerKilled,
                killedOldPosition: killedOldPosition,
            });

            const fighters = this.endCombat(roomId, server, playerKiller);

            return [playerKiller, playerKilled, fighters];
        }
        return [null, null, []];
    }

    disperseKilledPlayerObjects(roomId: string, player: PlayerCoord): void {
        const gameInstance = this.activeGamesService.getActiveGame(roomId);
        const game = gameInstance.game;
        const position = player.position;
        const possiblePositions = this.verifyPossibleObjectsPositions(roomId, position);
        const randomIndex = Math.floor(Math.random() * possiblePositions.length);
        game.map[position].item = player.player.inventory[FIRST_INVENTORY_SLOT];
        game.map[randomIndex].item = player.player.inventory[SECOND_INVENTORY_SLOT];
    }

    teleportPlayerToHome(roomId: string, player: PlayerCoord): void {
        const gameInstance = this.activeGamesService.getActiveGame(roomId);
        const game = gameInstance.game;
        game.map[player.position].hasPlayer = false;
        const playerHomePosition = player.player.homePosition;
        if (game.map[playerHomePosition].hasPlayer === false) {
            player.position = playerHomePosition;
            game.map[playerHomePosition].hasPlayer = true;
        } else {
            // if the home position taken, find a new position near home position
            const verifiedPositions = this.verifyPossibleObjectsPositions(roomId, playerHomePosition);
            console.log('verifiedPositions when teleport:', verifiedPositions);
            const randomIndex = Math.floor(Math.random() * verifiedPositions.length);
            player.position = playerHomePosition + verifiedPositions[randomIndex];
            game.map[player.position].hasPlayer = true;
        }
    }

    private throwDice(diceSize: number): number {
        return Math.floor(Math.random() * diceSize) + 1;
    }

    private verifyPossibleObjectsPositions(roomId: string, position: number): number[] {
        const gameInstance = this.activeGamesService.getActiveGame(roomId);
        const game = gameInstance.game;
        const mapSize = parseInt(game.mapSize, 10);
        const verifiedPositions = [];
        const mapLength = gameInstance.game.map.length;

        let n: number = 0;
        while (verifiedPositions.length === 0) {
            n++;

            // Check right movement
            if (position % mapSize < mapSize) {
                if (
                    game.map[position + RIGHT_TILE * n].tileType !== TileTypes.WALL &&
                    game.map[position + RIGHT_TILE * n].tileType !== TileTypes.DOORCLOSED
                ) {
                    verifiedPositions.push(RIGHT_TILE * n);
                }
            }

            // Check left movement
            if (position % mapSize <= 0) {
                if (
                    game.map[position + LEFT_TILE * n].tileType !== TileTypes.WALL &&
                    game.map[position + LEFT_TILE * n].tileType !== TileTypes.DOORCLOSED
                ) {
                    verifiedPositions.push(LEFT_TILE * n);
                }
            }

            // Check upward movement
            if (position - mapSize * n >= 0) {
                if (
                    game.map[position - mapSize * n].tileType !== TileTypes.WALL &&
                    game.map[position - mapSize * n].tileType !== TileTypes.DOORCLOSED
                ) {
                    verifiedPositions.push(n * mapSize * -1);
                }
            }

            // Check downward movement
            if (position + mapSize * n < mapLength) {
                if (
                    game.map[position + mapSize * n].tileType !== TileTypes.WALL &&
                    game.map[position + mapSize * n].tileType !== TileTypes.DOORCLOSED
                ) {
                    verifiedPositions.push(mapSize * n);
                }
            }
        }
        console.log('verifiedPositions:', verifiedPositions);
        return verifiedPositions;
    }

    private canPlayerEscape(roomId: string, player: PlayerCoord): boolean {
        if (this.isPlayerInCombat(roomId, player)) {
            const randomNumber = Math.random();
            return randomNumber < ESCAPE_PROBABILITY;
        }
        return false;
    }

    private isPlayerOnIce(roomId: string, player: PlayerCoord): boolean {
        const position = player.position;
        const game = this.activeGamesService.getActiveGame(roomId).game;
        return game.map[position].tileType === TileTypes.ICE;
    }

    private resetHealth(fighter: PlayerCoord): void {
        fighter.player.attributes.currentHealth = fighter.player.attributes.health;
    }

    private resetAttack(fighter: PlayerCoord): void {
        fighter.player.attributes.currentAttack = fighter.player.attributes.attack;
    }

    private resetDefense(fighter: PlayerCoord): void {
        fighter.player.attributes.currentDefense = fighter.player.attributes.defense;
    }

    private resetSpeed(fighter: PlayerCoord): void {
        fighter.player.attributes.currentSpeed = fighter.player.attributes.speed;
    }
}
