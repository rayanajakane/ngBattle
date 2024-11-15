import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import {
    ATTACKER_INDEX,
    BOOSTED_BONUS_DICE,
    COMBAT_FIGHTERS_NUMBER,
    DEFAULT_BONUS_DICE,
    DEFAULT_ESCAPE_TOKENS,
    DEFENDER_INDEX,
    ESCAPE_CHANCE,
    FIRST_INVENTORY_SLOT,
    ICE_PENALTY,
    LEFT_TILE,
    RIGHT_TILE,
    SECOND_INVENTORY_SLOT,
    SUCCESSFUL_ATTACK_DAMAGE,
} from '@app/services/combat/constants';
import { MovementService } from '@app/services/movement/movement.service';
import { CombatAction } from '@common/combat-actions';
import { PlayerAttribute, PlayerCoord } from '@common/player';
import { TileTypes } from '@common/tile-types';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CombatService {
    private fightersMap: Map<string, PlayerCoord[]> = new Map(); // room id and fighters
    private currentTurnMap: Map<string, number> = new Map(); // Track current turn index by roomId

    constructor(
        @Inject(ActiveGamesService) private readonly activeGamesService: ActiveGamesService,
        @Inject(MovementService) private readonly movementService: MovementService,
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

    startCombat(roomId: string, fighters: PlayerCoord[]): void {
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

            // Initialize turn to first player
            const firstPlayer = this.whoIsFirstPlayer(roomId);
            const firstPlayerIndex = fighters.findIndex((f) => f.player.id === firstPlayer.player.id);
            this.currentTurnMap.set(roomId, firstPlayerIndex);
        }
    }

    endCombat(roomId: string, player?: PlayerCoord): PlayerCoord[] {
        // inc wins if a player leaves game
        if (this.fightersMap.get(roomId).length === 1) {
            this.setWinner(roomId, player);
        }

        const fighters = this.fightersMap.get(roomId);
        if (fighters.length !== 0) {
            // reset health no matter how combat ended
            fighters.forEach((fighter) => {
                this.resetHealth(fighter);
            });
        }
        this.fightersMap.delete(roomId);
        this.currentTurnMap.delete(roomId);
        return fighters;
    }

    whoIsFirstPlayer(roomId: string): PlayerCoord {
        const currentFighters = this.fightersMap.get(roomId);
        return currentFighters[ATTACKER_INDEX].player.attributes.speed >= currentFighters[DEFENDER_INDEX].player.attributes.speed
            ? currentFighters[ATTACKER_INDEX]
            : currentFighters[DEFENDER_INDEX];
    }

    applyIceDisadvantage(roomId: string, player: PlayerCoord): void {
        if (this.isPlayerInCombat(roomId, player)) {
            for (const fighter of this.fightersMap.get(roomId)) {
                if (this.isPlayerOnIce(roomId, player)) {
                    fighter.player.attributes.currentAttack -= ICE_PENALTY;
                    fighter.player.attributes.currentAttack -= ICE_PENALTY;

                    fighter.player.attributes.currentDefense -= ICE_PENALTY;
                    fighter.player.attributes.currentDefense -= ICE_PENALTY;
                }
            }
        }
    }

    setEscapeTokens(roomId: string): void {
        if (this.fightersMap.get(roomId).length === COMBAT_FIGHTERS_NUMBER) {
            this.fightersMap.get(roomId).forEach((fighter) => {
                fighter.player.attributes.escape = DEFAULT_ESCAPE_TOKENS;
            });
        }
    }

    escape(roomId: string, player: PlayerCoord): [PlayerAttribute['escape'], boolean] {
        // only the player's turn can escape
        if (this.getCurrentTurnPlayer(roomId)?.player.id !== player.player.id) {
            return;
        }
        if (this.isPlayerInCombat(roomId, player) && !this.canPlayerEscape(roomId, player)) {
            player.player.attributes.escape -= 1;
            this.endCombatTurn(roomId, player);
            return [player.player.attributes.escape, false];
        } else if (this.isPlayerInCombat(roomId, player) && this.canPlayerEscape(roomId, player)) {
            this.endCombat(roomId);
            return [player.player.attributes.escape, true];
        }
    }

    setWinner(roomId: string, player: PlayerCoord): void {
        if (this.isPlayerInCombat(roomId, player)) player.player.wins += 1;
    }

    // startCombatTimer

    // endCombatTimer

    startCombatTurn(roomId: string, player: PlayerCoord, combatAction: CombatAction): void {
        if (combatAction === CombatAction.ATTACK) {
            const defender = this.fightersMap.get(roomId).find((fighter) => fighter.player.id !== player.player.id);
            this.attack(roomId, player, defender);
        } else if (combatAction === CombatAction.ESCAPE) {
            this.escape(roomId, player);
        }
    }

    endCombatTurn(roomId: string, player: PlayerCoord): void {
        if (!this.isPlayerInCombat(roomId, player)) return;
        const currentTurnIndex = this.currentTurnMap.get(roomId) || ATTACKER_INDEX;

        // Change the turn to the other fighter
        const newTurnIndex = (currentTurnIndex + 1) % COMBAT_FIGHTERS_NUMBER;
        this.currentTurnMap.set(roomId, newTurnIndex);
        // start other player's timer
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
        const isAttackSuccessful =
            attacker.player.attributes.currentAttack + attackerRoll >= defender.player.attributes.currentDefense + defenderRoll;
        return [isAttackSuccessful, [attackerRoll, defenderRoll]];
    }

    attack(roomId: string, attackPlayer: PlayerCoord, defensePlayer: PlayerCoord): [number, number, string, PlayerCoord] {
        if (this.isPlayerInCombat(roomId, attackPlayer) && this.isPlayerInCombat(roomId, defensePlayer)) {
            const checkAttack = this.checkAttackSuccessful(attackPlayer, defensePlayer);
            if (checkAttack[0]) {
                defensePlayer.player.attributes.currentHealth -= SUCCESSFUL_ATTACK_DAMAGE;
                if (defensePlayer.player.attributes.currentHealth <= 0) {
                    this.endCombat(roomId, defensePlayer);
                    return [checkAttack[1][0], checkAttack[1][1], 'combatEnd', defensePlayer];
                }
            }
            this.endCombatTurn(roomId, attackPlayer);
            return [checkAttack[1][0], checkAttack[1][1], 'combatTurnEnd', defensePlayer];
        }
        return [-1, -1, 'playerNotInCombat', defensePlayer];
    }

    resetAllAttributes(roomId: string, fighter: PlayerCoord): void {
        if (this.isPlayerInCombat(roomId, fighter)) {
            this.resetHealth(fighter);
            this.resetAttack(fighter);
            this.resetDefense(fighter);
            this.resetSpeed(fighter);
        }
    }

    killPlayer(roomId: string, player: PlayerCoord): PlayerCoord[] {
        const playerKilled: PlayerCoord = player;
        const playerKiller: PlayerCoord = this.fightersMap.get(roomId).find((fighter) => fighter.player.id !== player.player.id);
        if (playerKiller && playerKilled) {
            this.setWinner(roomId, playerKiller);
            this.disperseKilledPlayerObjects(roomId, playerKilled);
            this.resetAllAttributes(roomId, playerKilled);
            this.teleportPlayerToHome(roomId, playerKilled);
            this.resetAllAttributes(roomId, playerKiller);
            this.endCombat(roomId);
            return [playerKiller, playerKilled];
        }
        return [];
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
        const playerHomePosition = player.player.homePosition;
        if (game.map[playerHomePosition].hasPlayer === false) {
            player.position = playerHomePosition;
        } else {
            // if the home position taken, find a new position near home position
            const verifiedPositions = this.verifyPossibleObjectsPositions(roomId, playerHomePosition);
            const randomIndex = Math.floor(Math.random() * verifiedPositions.length);
            player.position = playerHomePosition + verifiedPositions[randomIndex];
        }
    }

    private throwDice(diceSize: number): number {
        return Math.floor(Math.random() * diceSize) + 1;
    }

    private verifyPossibleObjectsPositions(roomId: string, position: number): number[] {
        const gameInstance = this.activeGamesService.getActiveGame(roomId);
        const game = gameInstance.game;
        const mapSize = parseInt(game.mapSize, 10);
        const possiblePositions = [RIGHT_TILE, LEFT_TILE, mapSize, -mapSize];
        const verifiedPositions = [];
        possiblePositions.forEach((pos) => {
            if (game.map[position + pos].tileType !== TileTypes.WALL && game.map[position + pos].tileType !== TileTypes.WATER) {
                verifiedPositions.push(pos);
            } else {
                pos *= 2;
            }
            if (verifiedPositions.length === 0) {
                if (game.map[position + pos].tileType !== TileTypes.WALL && game.map[position + pos].tileType !== TileTypes.WATER) {
                    verifiedPositions.push(pos);
                }
            }
        });
        return verifiedPositions;
    }

    private canPlayerEscape(roomId: string, player: PlayerCoord): boolean {
        if (this.isPlayerInCombat(roomId, player) && player.player.attributes.escape > 0) {
            const randomNumber = Math.floor(Math.random());
            return randomNumber < ESCAPE_CHANCE;
        }
    }

    private isPlayerOnIce(roomId: string, player: PlayerCoord): boolean {
        if (this.isPlayerInCombat(roomId, player)) {
            const position = player.position;
            const game = this.activeGamesService.getActiveGame(roomId).game;
            return game.map[position].tileType === TileTypes.ICE;
        }
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
