import { ActionService } from '@app/services/action/action.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { CombatService } from '@app/services/combat/combat.service';
import { GameService } from '@app/services/game.service';
import { MovementService } from '@app/services/movement/movement.service';
import { Player, PlayerCoord } from '@common/player';
import { TileTypes } from '@common/tile-types';
import { Test, TestingModule } from '@nestjs/testing';
import { ActionButtonService } from './action-button.service';

describe('ActionButtonService', () => {
    let service: ActionButtonService;
    let activeGamesService: ActiveGamesService;
    let combatService: CombatService;
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
                ActionButtonService,
                ActiveGamesService,
                ActionService,
                CombatService,
                MovementService,
            ],
        }).compile();
        service = module.get<ActionButtonService>(ActionButtonService);
        activeGamesService = module.get<ActiveGamesService>(ActiveGamesService);
        combatService = module.get<CombatService>(CombatService);
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

    // An actual game instance is needed to test this function

    // it('should return players around the given position', () => {
    //     // Arrange
    //     const roomId = '123abc';
    //     const position = 5;
    //     const mockPlayersAround = [
    //         { player: { id: 'playerId' }, position: 6 },
    //         { player: { id: 'opponentId' }, position: 4 },
    //     ] as PlayerCoord[];

    //     const game: GameStructure = {
    //         id: 'gameId',
    //         gameName: 'Test Game',
    //         gameDescription: 'This is a test game',
    //         mapSize: '10x10',
    //         map: [
    //             // Define your tile structures here
    //         ],
    //         gameType: 'Test',
    //         isVisible: true,
    //         creationDate: '2022-01-01',
    //         lastModified: '2022-01-02',
    //     };

    //     const mockActiveGame: GameInstance = {
    //         roomId: roomId,
    //         game: game,
    //         playersCoord: mockPlayersAround,
    //     };

    //     jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(mockActiveGame);

    //     // Act
    //     const result = service.getPlayersAround(roomId, position);

    //     // Assert
    //     expect(result).toEqual(mockPlayersAround);
    //     expect(activeGamesService.getActiveGame).toHaveBeenCalledWith(roomId);
    // });
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
});
