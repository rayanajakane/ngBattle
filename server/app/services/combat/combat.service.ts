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
    SECOND_INVENTORY_SLOT,
    SUCCESSFUL_ATTACK_DAMAGE,
} from '@app/services/combat/constants';
import { MovementService } from '@app/services/movement/movement.service';
import { CombatAction } from '@common/combat-actions';
import { PlayerCoord } from '@common/player';
import { TileTypes } from '@common/tile-types';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CombatService {
    private fightersMap: Map<string, PlayerCoord[]> = new Map(); // room id and fighters
    constructor(
        @Inject(ActiveGamesService) private readonly activeGamesService: ActiveGamesService,
        @Inject(MovementService) private readonly movementService: MovementService,
    ) {}

    isPlayerInCombat(roomId: string, PlayerCoord): boolean {
        return this.fightersMap.get(roomId).find((fighter) => fighter.player.id === roomId) !== undefined;
    }

    // TODO : decide whether the first action after the combat starts is attack or escape
    startCombat(roomId: string, fighters: PlayerCoord[]): void {
        if (fighters.length === COMBAT_FIGHTERS_NUMBER) {
            fighters.forEach((fighter) => {
                if (fighter.player.attributes.currentHealth === undefined) {
                    fighter.player.attributes.currentHealth = fighter.player.attributes.health;
                }
            });
            this.fightersMap.set(roomId, fighters);
            this.setEscapeTokens(roomId);
            this.startCombatTurn(this.whoIsFirstPlayer(roomId), CombatAction.ATTACK);
        }
    }

    endCombat(roomId: string, player?: PlayerCoord): void {
        if (this.fightersMap.get(roomId).length === COMBAT_FIGHTERS_NUMBER) {
            this.fightersMap.delete(roomId);
            // call other functions
        } else {
            //endCombatTimer();
        }
    }

    whoIsFirstPlayer(roomId: string): PlayerCoord {
        const currentFighters = this.fightersMap.get(roomId);
        return currentFighters[ATTACKER_INDEX].player.attributes.speed >= currentFighters[DEFENDER_INDEX].player.attributes.speed
            ? currentFighters[ATTACKER_INDEX]
            : currentFighters[DEFENDER_INDEX];
    }

    // -2 sur son attaque et sa défense
    isPlayerOnIce(roomId: string, player: PlayerCoord): boolean {
        if (this.isPlayerInCombat(roomId, player)) {
            const position = player.position;
            const game = this.activeGamesService.getActiveGame(roomId).game;
            return game.map[position].tileType === TileTypes.ICE;
        }
    }

    applyIceDisadvantage(roomId: string, player: PlayerCoord): void {
        if (this.isPlayerInCombat(roomId, player)) {
            for (const fighter of this.fightersMap.get(roomId)) {
                if (this.isPlayerOnIce(roomId, player)) {
                    fighter.player.attributes.attack -= ICE_PENALTY;
                    fighter.player.attributes.attack -= ICE_PENALTY;
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

    canEscape(): boolean {
        const randomNumber = Math.floor(Math.random());
        return randomNumber < ESCAPE_CHANCE;
    }

    escape(roomId: string, player: PlayerCoord): void {
        if (!this.canEscape() && this.isPlayerInCombat(roomId, player)) {
            player.player.attributes.escape -= 1;
            // endCombatTurn(player: PlayerCoord);
        } else {
            // endCombat();
        }
    }

    setWinner(roomId: string, player: PlayerCoord): void {
        if (this.isPlayerInCombat(roomId, player)) player.player.wins += 1;
    }

    // startCombatTimer

    // endCombatTimer

    startCombatTurn(player: PlayerCoord, combatAction: CombatAction): void {
        // startCombatTimer();
        // player can choose to attack or to escape
        if (combatAction === CombatAction.ATTACK) {
            // attack();
        } else if (combatAction === CombatAction.ESCAPE) {
            // escape();
        }
    }

    // endCombatTurn(player: PlayerCoord)

    throwDice(diceSize: number): number {
        return Math.floor(Math.random() * diceSize) + 1;
    }

    isAttackSuccessful(attacker: PlayerCoord, defender: PlayerCoord): boolean {
        let bonusAttackDice: number = DEFAULT_BONUS_DICE;
        let bonusDefenseDice: number = DEFAULT_BONUS_DICE;
        if (attacker.player.attributes.dice === 'attack') bonusAttackDice = BOOSTED_BONUS_DICE;
        else if (defender.player.attributes.dice === 'defense') bonusDefenseDice = BOOSTED_BONUS_DICE;

        return (
            attacker.player.attributes.attack + this.throwDice(bonusAttackDice) >=
            defender.player.attributes.defense + this.throwDice(bonusDefenseDice)
        );
    }

    attack(roomId: string, attackPlayer: PlayerCoord, defensePlayer: PlayerCoord): void {
        if (this.isPlayerInCombat(roomId, attackPlayer) && this.isPlayerInCombat(roomId, defensePlayer)) {
            if (this.isAttackSuccessful(attackPlayer, defensePlayer)) {
                defensePlayer.player.attributes.health = (Number(defensePlayer.player.attributes.health) - SUCCESSFUL_ATTACK_DAMAGE).toString();
                if (Number(defensePlayer.player.attributes.health) <= 0) {
                    this.endCombat(roomId, defensePlayer);
                }
            }
        }
    }
    canPlayerEscape(roomId: string, player: PlayerCoord): boolean {
        if (this.isPlayerInCombat(roomId, player)) return player.player.attributes.escape > 0;
    }

    resetAttributes(roomId: string): void {
        // TODO: reset attack too

        // reset health
        this.fightersMap.get(roomId)[ATTACKER_INDEX].player.attributes.currentHealth =
            this.fightersMap.get(roomId)[ATTACKER_INDEX].player.attributes.health;
        this.fightersMap.get(roomId)[DEFENDER_INDEX].player.attributes.currentHealth =
            this.fightersMap.get(roomId)[DEFENDER_INDEX].player.attributes.health;

        // reset escape tokens
        for (const fighter of this.fightersMap.get(roomId)) {
            fighter.player.attributes.escape = DEFAULT_ESCAPE_TOKENS;
        }
    }

    killPlayer(roomId: string, player: PlayerCoord): void {
        const playerKilled: PlayerCoord = player;
        const playerKiller: PlayerCoord = this.fightersMap.get(roomId).find((fighter) => fighter.player.id !== player.player.id);
        // killer must go back to home and have his attributes reset and have 1 more win
        if (playerKiller) {
            this.setWinner(roomId, playerKiller);
            this.disperseKilledPlayerObjects(roomId, playerKilled);
            this.resetAttributes(roomId);
        }
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

    verifyPossibleObjectsPositions(roomId: string, position: number): number[] {
        const gameInstance = this.activeGamesService.getActiveGame(roomId);
        const game = gameInstance.game;
        const mapSize = parseInt(game.mapSize, 10);
        const possiblePositions = [1, -1, mapSize, -mapSize];
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
}
