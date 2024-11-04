import { TestBed } from '@angular/core/testing';

import { GameTile, TileJson, TilePreview } from '@app/data-structure/game-structure';
import { Player, PlayerAttribute } from '@app/interfaces/player';
import { MapBaseService } from './map-base.service';

const player1: Player = {
    id: '1',
    name: 'player1',
    isAdmin: false,
    avatar: '1',
    attributes: {} as PlayerAttribute,
    isActive: false,
    abandoned: true,
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
        const tileJson: TileJson = {
            idx: 0,
            tileType: '',
            item: '',
            hasPlayer: false,
        };

        expect(service.isGameTile(gameTile)).toBeTrue();
        expect(service.isGameTile(tileJson)).toBeFalse();
    });
});
