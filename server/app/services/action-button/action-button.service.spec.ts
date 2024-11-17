import { GameInstance } from '@app/data-structures/game-instance';
import { ActionService } from '@app/services/action/action.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { CombatService } from '@app/services/combat/combat.service';
import { GameService } from '@app/services/game.service';
import { MovementService } from '@app/services/movement/movement.service';
import { GameStructure, TileStructure } from '@common/game-structure';
import { Player, PlayerCoord } from '@common/player';
import { TileTypes } from '@common/tile-types';
import { Test, TestingModule } from '@nestjs/testing';
import { ActionButtonService } from './action-button.service';

describe('ActionButtonService', () => {
    let service: ActionButtonService;
    let activeGamesService: ActiveGamesService;
    let combatService: CombatService;
    let actionService: ActionService;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: GameService,
                    useValue: {
                        getPlayersAround: jest.fn(),
                        getDoorsAround: jest.fn(),
                    },
                },
                {
                    provide: ActionService,
                    useValue: {
                        interactWithDoor: jest.fn(),
                        startCombat: jest.fn(),
                        movePlayer: jest.fn(),
                        performAction: jest.fn(),
                    },
                },
                {
                    provide: ActiveGamesService,
                    useValue: {
                        getActiveGame: jest.fn(),
                    },
                },
                {
                    provide: CombatService,
                    useValue: {
                        startCombat: jest.fn(),
                    },
                },
                ActionButtonService,
                MovementService,
            ],
        }).compile();
        service = module.get<ActionButtonService>(ActionButtonService);
        activeGamesService = module.get<ActiveGamesService>(ActiveGamesService);
        combatService = module.get<CombatService>(CombatService);
        actionService = module.get<ActionService>(ActionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return available indexes for players and doors around the active player', () => {
        const roomId = '123abc';
        const activePlayer: PlayerCoord = { player: { id: 'playerId' } as Player, position: 5 } as PlayerCoord;
        const mockPlayersAround = [{ player: { id: 'opponentId' }, position: 6 }] as PlayerCoord[];
        const mockDoorsAround = [{ idx: 7, tileType: TileTypes.DOOR, item: 'wall', hasPlayer: false }];

        jest.spyOn(service, 'getPlayersAround').mockReturnValue(mockPlayersAround);
        jest.spyOn(service, 'getDoorsAround').mockReturnValue(mockDoorsAround);

        const result = service.getAvailableIndexes(roomId, activePlayer);

        expect(result).toEqual([6, 7]);
    });

    it('should start combat with the given fighters', () => {
        const roomId = '123abc';
        const fighters: PlayerCoord[] = [
            { player: { id: 'player1' } as Player, position: 1 },
            { player: { id: 'player2' } as Player, position: 2 },
        ] as PlayerCoord[];

        jest.spyOn(combatService, 'startCombat').mockImplementation((roomId: string, fighters: PlayerCoord[]) => {
            return null;
        });

        service.startCombat(roomId, fighters);

        expect(combatService.startCombat).toHaveBeenCalledWith(roomId, fighters);
    });
    it('should interact with door if tile is a door', () => {
        const roomId = '123abc';
        const originalPlayer: PlayerCoord = { player: { id: 'playerId' } as Player, position: 5 } as PlayerCoord;
        const tileIndex = 0;

        const mockMap = [
            {
                idx: 0,
                tileType: TileTypes.DOORCLOSED,
                item: '',
                hasPlayer: false,
            },
            // ... other tiles
            {
                idx: 1,
                tileType: 'doorClosed',
                item: '',
                hasPlayer: false,
            },
            // ... other tiles
        ] as TileStructure[];

        const game: GameStructure = {
            id: 'f01d532b-31f8-4158-9398-29a03c39e646',
            gameName: 'BRUH',
            gameDescription: 'One day...',
            mapSize: '10',
            map: mockMap,
            gameType: 'classic',
            isVisible: true,
            creationDate: '2024-11-11T19:59:26.518Z',
            lastModified: '16/11/2024, 12:39:04',
        };

        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue({
            game: game,
        } as GameInstance);

        jest.spyOn(actionService, 'interactWithDoor');

        service.chosenAction(roomId, originalPlayer, tileIndex);

        expect(actionService.interactWithDoor).toHaveBeenCalledWith(roomId, originalPlayer.player.id, originalPlayer.position);
    });

    it('should start combat if tile has a player', () => {
        const roomId = '123abc';
        const originalPlayer: PlayerCoord = { player: { id: 'playerId' } as Player, position: 0 } as PlayerCoord;
        const tileIndex = 1;

        const mockMap = [
            {
                idx: 0,
                tileType: TileTypes.ICE,
                item: '',
                hasPlayer: false,
            },
            {
                idx: 1,
                tileType: TileTypes.WALL,
                item: '',
                hasPlayer: true,
            },
            // ... other tiles
        ] as TileStructure[];

        const game: GameStructure = {
            id: 'f01d532b-31f8-4158-9398-29a03c39e646',
            gameName: 'BRUH',
            gameDescription: 'One day...',
            mapSize: '10',
            map: mockMap,
            gameType: 'classic',
            isVisible: true,
            creationDate: '2024-11-11T19:59:26.518Z',
            lastModified: '16/11/2024, 12:39:04',
        };

        const targetPlayer: PlayerCoord = { player: { id: 'opponentId' } as Player, position: 1 } as PlayerCoord;

        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue({
            game: game,
            playersCoord: [originalPlayer, targetPlayer],
        } as GameInstance);

        jest.spyOn(service, 'startCombat');

        service.chosenAction(roomId, originalPlayer, tileIndex);

        expect(service.startCombat).toHaveBeenCalledWith(roomId, [originalPlayer, targetPlayer]);
    });
});
