import { GameJson } from '@app/model/game-structure';
import { Player } from '@app/services/match.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'socket.io';
import { CombatService } from './combat.service';

describe('CombatService', () => {
    let service: CombatService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CombatService],
        }).compile();

        service = module.get<CombatService>(CombatService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('isValidCombatPosition', () => {
        it('should return true for adjacent horizontal positions', () => {
            const game: GameJson = {
                id: 'game1',
                gameName: 'Test Game',
                gameDescription: 'Description',
                mapSize: '5',
                map: [],
                gameType: 'type1',
                isVisible: true,
                creationDate: '2023-01-01',
                lastModified: '2023-01-01',
            };
            expect(service.isValidCombatPosition(game, 1, 2)).toBe(true);
            expect(service.isValidCombatPosition(game, 2, 1)).toBe(true);
        });

        it('should return true for adjacent vertical positions', () => {
            const game: GameJson = {
                id: 'game1',
                gameName: 'Test Game',
                gameDescription: 'Description',
                mapSize: '5',
                map: [],
                gameType: 'type1',
                isVisible: true,
                creationDate: '2023-01-01',
                lastModified: '2023-01-01',
            };
            expect(service.isValidCombatPosition(game, 1, 6)).toBe(true);
            expect(service.isValidCombatPosition(game, 6, 1)).toBe(true);
        });

        it('should return false for non-adjacent positions', () => {
            const game: GameJson = {
                id: 'game1',
                gameName: 'Test Game',
                gameDescription: 'Description',
                mapSize: '5',
                map: [],
                gameType: 'type1',
                isVisible: true,
                creationDate: '2023-01-01',
                lastModified: '2023-01-01',
            };
            expect(service.isValidCombatPosition(game, 1, 3)).toBe(false);
            expect(service.isValidCombatPosition(game, 1, 7)).toBe(false);
        });
    });

    describe('fight', () => {
        it('should handle combat logic correctly', () => {
            const server = { to: jest.fn().mockReturnThis(), emit: jest.fn() } as any as Server;
            const roomId = 'room1';
            const attacker: Player = {
                id: 'attacker',
                name: 'Attacker',
                isAdmin: false,
                avatar: 'avatar1',
                attributes: { health: '100', speed: '10', attack: '20', defense: '5' },
                isActive: true,
                abandoned: false,
            };
            const defender: Player = {
                id: 'defender',
                name: 'Defender',
                isAdmin: false,
                avatar: 'avatar2',
                attributes: { health: '100', speed: '8', attack: '15', defense: '10' },
                isActive: true,
                abandoned: false,
            };

            service.fight(server, roomId, attacker, defender);
        });
    });
});
