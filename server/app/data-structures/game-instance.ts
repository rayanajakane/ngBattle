import { TimerService } from '@app/services/timer/timer.service';
import { GameStructure } from '@common/game-structure';
import { Player, PlayerCoord } from '@common/player';
export interface GameInstance {
    roomId: string;
    game: GameStructure;
    turnTimer?: TimerService;
    playersCoord?: PlayerCoord[];
    fightParticipants?: Player[];
    fightTurns?: number;
    turn?: number;
    currentPlayerMoveBudget?: number;
    currentPlayerActionPoint?: number;
}
