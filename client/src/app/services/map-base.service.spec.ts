import { TestBed } from '@angular/core/testing';

import { GameTile, TileJson, TilePreview } from '@app/data-structure/game-structure';
import { MapBaseService } from './map-base.service';

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
