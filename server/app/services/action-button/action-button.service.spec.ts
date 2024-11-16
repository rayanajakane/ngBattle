import { Player, PlayerCoord } from '@common/player';
import { TileTypes } from '@common/tile-types';
import { Test, TestingModule } from '@nestjs/testing';
import { ActionButtonService } from './action-button.service';

describe('ActionButtonService', () => {
    let service: ActionButtonService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ActionButtonService],
        }).compile();

        service = module.get<ActionButtonService>(ActionButtonService);
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
});
