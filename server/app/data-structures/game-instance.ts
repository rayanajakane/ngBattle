import { CombatTimerService } from '@app/services/combat-timer/combat-timer.service';
import { TimerService } from '@app/services/timer/timer.service';
import { GameStructure } from '@common/game-structure';
import { PlayerCoord } from '@common/player';
import { GameMode } from '@common/game-structure';
export interface GameInstance {
    roomId: string;
    // gameMode: GameMode;
    game: GameStructure;
    turnTimer?: TimerService;
    combatTimer?: CombatTimerService;
    playersCoord?: PlayerCoord[];
    fightTurns?: number;
    turn?: number;
    currentPlayerMoveBudget?: number;
    currentPlayerActionPoint?: number;
}
