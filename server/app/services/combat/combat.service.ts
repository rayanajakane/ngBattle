import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import {
    ATTACKER_INDEX,
    BOOSTED_BONUS_DICE,
    COMBAT_FIGHTERS_NUMBER,
    COMBAT_ROUND_DURATION,
    COMBAT_ROUND_DURATION_NO_ESCAPE,
    DEFAULT_BONUS_DICE,
    DEFAULT_ESCAPE_TOKENS,
    DEFENDER_INDEX,
    ESCAPE_CHANCE,
    ICE_PENALTY,
} from '@app/services/combat/constants';
import { CombatAction } from '@common/combat-actions';
import { PlayerCoord } from '@common/player';
import { TileTypes } from '@common/tile-types';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CombatService {
    fighters: PlayerCoord[] = [];
    roomId: string;
    defaultHealth: number[] = [];
    constructor(@Inject(ActiveGamesService) private readonly activeGamesService: ActiveGamesService) {}

    // check if player is in combat
    isPlayerInCombat(player: PlayerCoord): boolean {
        return this.fighters.some((fighter) => fighter.player.id === player.player.id);
    }

    // temp func
    test(): string {
        return [COMBAT_ROUND_DURATION, COMBAT_ROUND_DURATION_NO_ESCAPE].join(' ');
    }
    // BY FRONTEND
    startCombat(roomId: string, fighters: PlayerCoord[]): void {
        this.fighters = fighters;
        if (this.fighters.length === COMBAT_FIGHTERS_NUMBER) {
            this.roomId = roomId;
            this.setEscapeTokens();
            fighters.forEach((player) => {
                this.defaultHealth.push(player.player.attributes.health);
            });

            this.startCombatTurn(this.whoIsFirstPlayer(), CombatAction.ATTACK);
        }
    }

    endCombat(player?: PlayerCoord): void {
        if (player) {
            this.setWinner(player);
        }
        if (this.fighters.length === COMBAT_FIGHTERS_NUMBER) {
            this.fighters = [];
            // call other functions
        }
    }

    whoIsFirstPlayer(): PlayerCoord {
        return this.fighters[ATTACKER_INDEX].player.attributes.speed >= this.fighters[DEFENDER_INDEX].player.attributes.speed
            ? this.fighters[ATTACKER_INDEX]
            : this.fighters[DEFENDER_INDEX];
    }

    // -2 sur son attaque et sa défense
    isPlayerOnIce(player: PlayerCoord): boolean {
        if (this.isPlayerInCombat(player)) {
            const position = player.position;
            const game = this.activeGamesService.getActiveGame(this.roomId).game;
            return game.map[position].tileType === TileTypes.ICE;
        }
    }

    applyIceDisadvantage(player: PlayerCoord): void {
        if (this.isPlayerInCombat(player)) {
            for (const fighter of this.fighters) {
                if (this.isPlayerOnIce(player)) {
                    fighter.player.attributes.attack -= ICE_PENALTY;
                    fighter.player.attributes.attack -= ICE_PENALTY;
                }
            }
        }
    }

    setEscapeTokens(): void {
        if (this.fighters.length === COMBAT_FIGHTERS_NUMBER) {
            this.fighters.forEach((fighter) => {
                fighter.player.attributes.escape = DEFAULT_ESCAPE_TOKENS;
            });
        }
    }

    canEscape(): boolean {
        const randomNumber = Math.floor(Math.random());
        return randomNumber < ESCAPE_CHANCE;
    }

    escape(player: PlayerCoord): void {
        if (!this.canEscape() && this.isPlayerInCombat(player)) {
            player.player.attributes.escape -= 1;
            // endCombatTurn(player: PlayerCoord);
        } else {
            // endCombat();
        }
    }

    setWinner(player: PlayerCoord): void {
        if (this.isPlayerInCombat(player)) player.player.wins += 1;
    }

    // startCombatTimer

    // endCombatTimer

    // BY FRONTEND
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
    // attack
    attack(attackPlayer: PlayerCoord, defensePlayer: PlayerCoord): void {
        if (this.isPlayerInCombat(attackPlayer) && this.isPlayerInCombat(defensePlayer)) {
            if (this.isAttackSuccessful(attackPlayer, defensePlayer)) {
                defensePlayer.player.attributes.health -= attackPlayer.player.attributes.attack;
                if (defensePlayer.player.attributes.health <= 0) {
                    this.endCombat(defensePlayer);
                }
            }
        }
    }
    canPlayerEscape(player: PlayerCoord): boolean {
        if (this.isPlayerInCombat(player)) return player.player.attributes.escape > 0;
    }

    resetAttributes(): void {
        this.fighters[ATTACKER_INDEX].player.attributes.health = this.defaultHealth[ATTACKER_INDEX];
        this.fighters[DEFENDER_INDEX].player.attributes.health = this.defaultHealth[DEFENDER_INDEX];
        this.fighters.forEach((fighter) => {
            fighter.player.attributes.escape = DEFAULT_ESCAPE_TOKENS;
        });
    }

    // killPlayer

    // disperseKilledPlayerObjects
}
