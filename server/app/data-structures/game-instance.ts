import { CombatTimerService } from '@app/services/combat-timer/combat-timer.service';
import { TimerService } from '@app/services/timer/timer.service';
import { GameStructure } from '@common/game-structure';
import { Player, PlayerCoord } from '@common/player';

export interface GameInstance {
    roomId: string;
    game: GameStructure;
    turnTimer?: TimerService;
    combatTimer?: CombatTimerService;
    playersCoord?: PlayerCoord[];
    fightParticipants?: Player[];
    fightTurns?: number;
    turn?: number;
    currentPlayerMoveBudget?: number;
    currentPlayerActionPoint?: number;
}
