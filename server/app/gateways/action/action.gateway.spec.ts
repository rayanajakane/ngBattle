import { ActionService } from '@app/services/action/action.service';
import { MatchService } from '@app/services/match.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Server, Socket } from 'socket.io';
import { ActionGateway, TileTypes } from './action.gateway';

describe('ActionGateway', () => {
    let gateway: ActionGateway;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ActionGateway],
        }).compile();

        gateway = module.get<ActionGateway>(ActionGateway);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
});
describe('ActionGateway', () => {
    let gateway: ActionGateway;
    let actionService: ActionService;
    let matchService: MatchService;
    let server: Server;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ActionGateway,
                {
                    provide: ActionService,
                    useValue: {
                        gameSetup: jest.fn(),
                        nextTurn: jest.fn(),
                        movePlayer: jest.fn(),
                        interactWithDoor: jest.fn(),
                        availablePlayerMoves: jest.fn(),
                        activeGames: [],
                    },
                },
                {
                    provide: MatchService,
                    useValue: {
                        rooms: new Map(),
                    },
                },
            ],
        }).compile();

        gateway = module.get<ActionGateway>(ActionGateway);
        actionService = module.get<ActionService>(ActionService);
        (actionService.movePlayer as jest.Mock) = jest.fn();
        matchService = module.get<MatchService>(MatchService);
        server = new Server();
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('should initialize server', () => {
        const mockServer = new Server();
        gateway.afterInit(mockServer);
        expect(gateway['server']).toBe(mockServer);
    });

    it('should format current time correctly', () => {
        const formattedTime = gateway.getCurrentTimeFormatted();
        expect(formattedTime).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    it('should update player position', () => {
        const roomId = 'room1';
        const playerId = 'player1';
        const newPlayerPosition = 5;
        const emitSpy = jest.spyOn(server, 'to').mockReturnValue({
            emit: jest.fn(),
        } as any);

        gateway.updatePlayerPosition(roomId, playerId, newPlayerPosition);

        expect(emitSpy).toHaveBeenCalledWith(roomId);
        // expect(emitSpy().emit).toHaveBeenCalledWith('playerPositionUpdate', {
        //     playerId,
        //     newPlayerPosition,
        // });
    });

    // it('should handle game setup', () => {
    //     const roomId = 'room1';
    //     const gameId = 'game1';
    //     const players = [
    //         { id: 'player1', name: 'Player 1', isAdmin: true, avatar: 'default', attributes: {} } as Player,
    //         { id: 'player2', name: 'Player 2', isAdmin: false, avatar: 'default', attributes: {} } as Player,
    //     ] as Player[];
    //     matchService.rooms.set(roomId, { gameId, players });

    //     const client = {} as Socket;
    //     gateway.handleGameSetup(client, roomId);

    //     expect(actionService.gameSetup).toHaveBeenCalledWith(server, roomId, gameId, players);
    // });

    it('should handle start turn', () => {
        const roomId = 'room1';
        const playerId = 'player1';
        const data = { roomId, playerId };
        const client = { emit: jest.fn() } as any as Socket;
        const activeGame = {
            roomId,
            playersCoord: [{ player: { id: playerId, attributes: { speed: '5' }, name: 'Player1' } }],
            turn: 0,
            currentPlayerMoveBudget: 0,
            currentPlayerActionPoint: 0,
        } as any;
        actionService.activeGames.push(activeGame);

        gateway.handleStartTurn(data, client);

        expect(activeGame.currentPlayerMoveBudget).toBe(5);
        expect(activeGame.currentPlayerActionPoint).toBe(1);
        expect(client.emit).toHaveBeenCalledWith('startTurn', expect.any(Array));
    });

    it('should handle move', () => {
        const roomId = 'room1';
        const playerId = 'player1';
        const endPosition = 5;
        const data = { roomId, playerId, endPosition };
        const client = { emit: jest.fn() } as any as Socket;
        const activeGame = {
            roomId,
            playersCoord: [{ player: { id: playerId }, position: 0 }],
            turn: 0,
            currentPlayerMoveBudget: 10,
            game: { map: [{}, {}, {}, {}, {}, { tileType: TileTypes.ICE }] },
        } as any;
        actionService.activeGames.push(activeGame);
        actionService.movePlayer = jest.fn().mockReturnValue([1, 2, 3, 4, 5]);

        gateway.handleMove(data, client);

        expect(actionService.movePlayer).toHaveBeenCalledWith(roomId, 0, endPosition);
        expect(client.emit).toHaveBeenCalledWith('endMove', {
            availableMoves: expect.any(Array),
            currentMoveBudget: activeGame.currentPlayerMoveBudget,
        });
    });

    it('should handle end turn', () => {
        const roomId = 'room1';
        const playerId = 'player1';
        const data = { roomId, playerId, lastTurn: false };
        const client = { emit: jest.fn() } as any as Socket;
        const activeGame = {
            roomId,
            playersCoord: [{ player: { id: playerId } }],
            turn: 0,
        } as any;
        actionService.activeGames.push(activeGame);

        gateway.handleEndTurn(client, data);

        expect(actionService.nextTurn).toHaveBeenCalledWith(roomId, false);
        expect(server.to(roomId).emit).toHaveBeenCalledWith('endTurn', expect.any(Number));
    });

    it('should handle interact door', () => {
        const roomId = 'room1';
        const playerId = 'player1';
        const doorPosition = 5;
        const data = { roomId, playerId, doorPosition };
        const client = { emit: jest.fn() } as any as Socket;
        const activeGame = {
            roomId,
            playersCoord: [{ player: { id: playerId, name: 'Player1' } }],
            currentPlayerActionPoint: 1,
            game: { map: [{}, {}, {}, {}, {}, { tileType: TileTypes.DOOROPEN }] },
        } as any;
        actionService.activeGames.push(activeGame);
        actionService.interactWithDoor = jest.fn().mockReturnValue(true);

        gateway.handleInteractDoor(client, data);

        expect(actionService.interactWithDoor).toHaveBeenCalledWith(roomId, playerId, doorPosition);
        expect(client.emit).toHaveBeenCalledWith('interactDoor', {
            isToggable: true,
            doorPosition,
            availableMoves: expect.any(Array),
        });
    });

    it('should handle quit game', () => {
        const roomId = 'room1';
        const playerId = 'player1';
        const data = { roomId, playerId };
        const client = { emit: jest.fn() } as any as Socket;
        const activeGame = {
            roomId,
            playersCoord: [{ player: { id: playerId, name: 'Player1' } }],
            turn: 0,
        } as any;
        actionService.activeGames.push(activeGame);

        gateway.handleQuitGame(client, data);

        expect(server.to(roomId).emit).toHaveBeenCalledWith('quitGame', playerId);
        expect(server.to(roomId).emit).toHaveBeenCalledWith('newLog', expect.any(Object));
    });
    describe('handleStartTurn', () => {
        let client: Socket;
        const mockAvailableMoves = [1, 2, 3];

        beforeEach(() => {
            client = { emit: jest.fn() } as any;
            jest.spyOn(gateway, 'getCurrentTimeFormatted').mockReturnValue('12:00:00');
            jest.spyOn(server.to('room1'), 'emit');
        });

        it('should initialize player move budget and action point', () => {
            const data = { roomId: 'room1', playerId: 'player1' };
            const activeGame = {
                roomId: 'room1',
                playersCoord: [
                    {
                        player: {
                            id: 'player1',
                            name: 'Player1',
                            attributes: { speed: '5' },
                        },
                    },
                ],
                currentPlayerMoveBudget: 0,
                currentPlayerActionPoint: 0,
                turn: 0,
            };
            actionService.activeGames.push(activeGame as any);
            (actionService.availablePlayerMoves as jest.Mock).mockReturnValue(mockAvailableMoves);

            gateway.handleStartTurn(data, client);

            expect(activeGame.currentPlayerMoveBudget).toBe(5);
            expect(activeGame.currentPlayerActionPoint).toBe(1);
        });

        it('should emit available moves to client', () => {
            const data = { roomId: 'room1', playerId: 'player1' };
            const activeGame = {
                roomId: 'room1',
                playersCoord: [
                    {
                        player: {
                            id: 'player1',
                            name: 'Player1',
                            attributes: { speed: '5' },
                        },
                    },
                ],
                turn: 0,
            } as any;
            actionService.activeGames.push(activeGame);
            (actionService.availablePlayerMoves as jest.Mock).mockReturnValue(mockAvailableMoves);

            gateway.handleStartTurn(data, client);

            expect(client.emit).toHaveBeenCalledWith('startTurn', mockAvailableMoves);
        });

        it('should emit log message to room', () => {
            const data = { roomId: 'room1', playerId: 'player1' };
            const activeGame = {
                roomId: 'room1',
                playersCoord: [
                    {
                        player: {
                            id: 'player1',
                            name: 'Player1',
                            attributes: { speed: '5' },
                        },
                    },
                ],
                turn: 0,
            } as any;
            actionService.activeGames.push(activeGame);
            (actionService.availablePlayerMoves as jest.Mock).mockReturnValue(mockAvailableMoves);

            gateway.handleStartTurn(data, client);

            expect(server.to('room1').emit).toHaveBeenCalledWith('newLog', {
                date: '12:00:00',
                message: 'Début de tour de Player1',
                receiver: 'player1',
            });
        });

        it('should handle invalid game instance', () => {
            const data = { roomId: 'invalidRoom', playerId: 'player1' };

            expect(() => gateway.handleStartTurn(data, client)).toThrow();
        });
    });
    describe('handleMove - detailed', () => {
        let client: Socket;
        let mockRandom: jest.SpyInstance;

        beforeEach(() => {
            client = { emit: jest.fn() } as any;
            mockRandom = jest.spyOn(Math, 'random');
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.clearAllMocks();
            jest.useRealTimers();
        });

        it('should handle normal movement without ice slip', () => {
            const data = { roomId: 'room1', playerId: 'player1', endPosition: 3 };
            const activeGame = {
                roomId: 'room1',
                playersCoord: [{ player: { id: 'player1' }, position: 0 }],
                turn: 0,
                game: {
                    map: Array(5).fill({ hasPlayer: false, tileType: TileTypes.BASIC }),
                },
                currentPlayerMoveBudget: 5,
            } as any;
            actionService.activeGames.push(activeGame);
            (actionService.movePlayer as jest.Mock).mockReturnValue([1, 2, 3]);
            (actionService.availablePlayerMoves as jest.Mock).mockReturnValue([4, 5, 6]);

            gateway.handleMove(data, client);
            jest.runAllTimers();

            expect(actionService.movePlayer).toHaveBeenCalledWith('room1', 0, 3);
            expect(client.emit).toHaveBeenCalledWith('endMove', {
                availableMoves: [4, 5, 6],
                currentMoveBudget: activeGame.currentPlayerMoveBudget,
            });
        });

        it('should handle ice slip mechanic', () => {
            const data = { roomId: 'room1', playerId: 'player1', endPosition: 2 };
            mockRandom.mockReturnValue(0.05); // 5% chance, below 10% threshold
            const activeGame = {
                roomId: 'room1',
                playersCoord: [{ player: { id: 'player1' }, position: 0 }],
                turn: 0,
                game: {
                    map: Array(3).fill({ hasPlayer: false, tileType: TileTypes.ICE }),
                },
                currentPlayerMoveBudget: 5,
            } as any;
            actionService.activeGames.push(activeGame);
            (actionService.movePlayer as jest.Mock).mockReturnValue([1, 2]);

            gateway.handleMove(data, client);
            jest.runAllTimers();

            expect(activeGame.currentPlayerMoveBudget).toBe(0);
        });

        it('should not process move if wrong player turn', () => {
            const data = { roomId: 'room1', playerId: 'player2', endPosition: 2 };
            const activeGame = {
                roomId: 'room1',
                playersCoord: [
                    { player: { id: 'player1' }, position: 0 },
                    { player: { id: 'player2' }, position: 1 },
                ],
                turn: 0,
                game: { map: [] },
            } as any;
            actionService.activeGames.push(activeGame);

            gateway.handleMove(data, client);

            expect(actionService.movePlayer).not.toHaveBeenCalled();
            expect(client.emit).not.toHaveBeenCalled();
        });

        it('should update player positions correctly during movement', () => {
            const data = { roomId: 'room1', playerId: 'player1', endPosition: 2 };
            const activeGame = {
                roomId: 'room1',
                playersCoord: [{ player: { id: 'player1' }, position: 0 }],
                turn: 0,
                game: {
                    map: Array(3).fill({ hasPlayer: false, tileType: TileTypes.BASIC }),
                },
            } as any;
            actionService.activeGames.push(activeGame);
            (actionService.movePlayer as jest.Mock).mockReturnValue([1, 2]);

            gateway.handleMove(data, client);
            jest.runAllTimers();

            expect(activeGame.game.map[0].hasPlayer).toBe(false);
            expect(activeGame.game.map[2].hasPlayer).toBe(true);
            expect(activeGame.playersCoord[0].position).toBe(2);
        });

        it('should emit position updates with correct timing', () => {
            const data = { roomId: 'room1', playerId: 'player1', endPosition: 2 };
            const activeGame = {
                roomId: 'room1',
                playersCoord: [{ player: { id: 'player1' }, position: 0 }],
                turn: 0,
                game: {
                    map: Array(3).fill({ hasPlayer: false, tileType: TileTypes.BASIC }),
                },
            } as any;
            actionService.activeGames.push(activeGame);
            (actionService.movePlayer as jest.Mock).mockReturnValue([1, 2]);
            const updateSpy = jest.spyOn(gateway, 'updatePlayerPosition');

            gateway.handleMove(data, client);
            jest.advanceTimersByTime(300);

            expect(updateSpy).toHaveBeenCalledTimes(2);
            expect(updateSpy).toHaveBeenNthCalledWith(1, 'room1', 'player1', 1);
            expect(updateSpy).toHaveBeenNthCalledWith(2, 'room1', 'player1', 2);
        });
    });
    describe('handleEndTurn - detailed', () => {
        let client: Socket;

        beforeEach(() => {
            client = { emit: jest.fn() } as any;
            jest.spyOn(server.to('room1'), 'emit');
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should process end turn for correct player', () => {
            const data = { roomId: 'room1', playerId: 'player1', lastTurn: false };
            const activeGame = {
                roomId: 'room1',
                playersCoord: [{ player: { id: 'player1' } }],
                turn: 0,
            } as any;
            actionService.activeGames.push(activeGame);

            gateway.handleEndTurn(client, data);

            expect(actionService.nextTurn).toHaveBeenCalledWith('room1', false);
            expect(server.to('room1').emit).toHaveBeenCalledWith('endTurn', expect.any(Number));
        });

        it('should not process end turn for wrong player', () => {
            const data = { roomId: 'room1', playerId: 'player2', lastTurn: false };
            const activeGame = {
                roomId: 'room1',
                playersCoord: [{ player: { id: 'player1' } }],
                turn: 0,
            } as any;
            actionService.activeGames.push(activeGame);

            gateway.handleEndTurn(client, data);

            expect(actionService.nextTurn).not.toHaveBeenCalled();
            expect(server.to('room1').emit).not.toHaveBeenCalled();
        });

        it('should handle last turn correctly', () => {
            const data = { roomId: 'room1', playerId: 'player1', lastTurn: true };
            const activeGame = {
                roomId: 'room1',
                playersCoord: [{ player: { id: 'player1' } }],
                turn: 0,
            } as any;
            actionService.activeGames.push(activeGame);

            gateway.handleEndTurn(client, data);

            expect(actionService.nextTurn).toHaveBeenCalledWith('room1', true);
        });

        it('should emit updated turn number', () => {
            const data = { roomId: 'room1', playerId: 'player1', lastTurn: false };
            const activeGame = {
                roomId: 'room1',
                playersCoord: [{ player: { id: 'player1' } }],
                turn: 0,
            } as any;
            const updatedGame = { ...activeGame, turn: 1 };
            actionService.activeGames.push(activeGame);

            // Mock the find after turn update
            jest.spyOn(actionService.activeGames, 'find').mockReturnValueOnce(updatedGame);

            gateway.handleEndTurn(client, data);

            expect(server.to('room1').emit).toHaveBeenCalledWith('endTurn', 1);
        });

        it('should handle non-existent game gracefully', () => {
            const data = { roomId: 'nonexistent', playerId: 'player1', lastTurn: false };

            expect(() => gateway.handleEndTurn(client, data)).not.toThrow();
            expect(actionService.nextTurn).not.toHaveBeenCalled();
            expect(server.to('nonexistent').emit).not.toHaveBeenCalled();
        });
    });
});
