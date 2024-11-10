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
        const randomNumber = Math.floor(Math.random() * 100);
        return randomNumber < 40;
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
        player.player.wins += 1;
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

    isAttackSuccessful(attacker: PlayerCoord, defender: PlayerCoord): boolean {
        let bonusAttackDice: number = DEFAULT_BONUS_DICE;
        let bonusDefenseDice: number = DEFAULT_BONUS_DICE;
        if (attacker.player.attributes.dice === 'attack') bonusAttackDice = BOOSTED_BONUS_DICE;
        else if (defender.player.attributes.dice === 'defense') bonusDefenseDice = BOOSTED_BONUS_DICE;

        return (
            attacker.player.attributes.attack + attacker.player.attributes.dice >=
            defender.player.attributes.defense + defender.player.attributes.dice
        );
    }
    // attack

    // canPlayerEscape

    // resetAttributes (for both players)

    // killPlayer

    // disperseKilledPlayerObjects
}
