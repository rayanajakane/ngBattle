import { TestBed } from '@angular/core/testing';
import { GameTile, TilePreview, TileStructure } from '@common/game-structure';
import { Player, PlayerAttribute, PlayerStats } from '@common/player';
import { MapBaseService } from './map-base.service';

const player1: Player = {
    id: '1',
    name: 'player1',
    isAdmin: false,
    avatar: '1',
    attributes: {} as PlayerAttribute,
    isActive: false,
    abandoned: true,
    wins: 0,
    stats: {} as PlayerStats,
};

describe('MapBaseService', () => {
    let service: MapBaseService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MapBaseService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('should identify GameTile correctly', () => {
        const gameTile: GameTile = {
            idx: 0,
            tileType: '',
            item: '',
            hasPlayer: false,
            isAccessible: TilePreview.NONE,
            player: player1,
        };
        const tileJson: TileStructure = {
            idx: 0,
            tileType: '',
            item: '',
            hasPlayer: false,
        };

        expect(service.isGameTile(gameTile)).toBeTrue();
        expect(service.isGameTile(tileJson)).toBeFalse();
    });
    it('should identify PlayerTile correctly', () => {
        const playerTile: GameTile & { player: { avatar: string } } = {
            idx: 0,
            tileType: '',
            item: '',
            hasPlayer: true,
            isAccessible: TilePreview.NONE,
            player: { avatar: '1' } as Player,
        };
        const nonPlayerTile: GameTile = {
            idx: 0,
            tileType: '',
            item: '',
            hasPlayer: false,
            isAccessible: TilePreview.NONE,
        } as GameTile;

        expect(service.isPlayerTile(playerTile)).toBeTrue();
        expect(service.isPlayerTile(nonPlayerTile)).toBeFalse();
    });
});
