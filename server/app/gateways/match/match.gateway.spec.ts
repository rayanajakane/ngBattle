import { ActionHandlerService } from '@app/services/action-handler/action-handler.service';
import { MatchService } from '@app/services/match.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Server, Socket } from 'socket.io';
import { MatchGateway } from './match.gateway';

describe('MatchGateway', () => {
    let gateway: MatchGateway;
    let matchService: MatchService;
    let actionHandlerService: ActionHandlerService;
    let mockServer: Server;
    let mockSocket: Socket;

    beforeEach(async () => {
        const mockMatchService = {
            createRoom: jest.fn(),
            joinRoom: jest.fn(),
            isCodeValid: jest.fn(),
            isRoomLocked: jest.fn(),
            getAllPlayersInRoom: jest.fn(),
            leaveRoom: jest.fn(),
            lockRoom: jest.fn(),
            unlockRoom: jest.fn(),
            kickPlayer: jest.fn(),
            startGame: jest.fn(),
            getMaxPlayers: jest.fn(),
            roomMessage: jest.fn(),
            loadAllMessages: jest.fn(),
            leaveAllRooms: jest.fn(),
        };

        const mockActionHandlerService = {
            handleQuitGame: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MatchGateway,
                { provide: MatchService, useValue: mockMatchService },
                { provide: ActionHandlerService, useValue: mockActionHandlerService },
            ],
        }).compile();

        gateway = module.get<MatchGateway>(MatchGateway);
        matchService = module.get<MatchService>(MatchService);
        actionHandlerService = module.get<ActionHandlerService>(ActionHandlerService);
        mockServer = { to: jest.fn() } as unknown as Server;
        mockSocket = { id: 'mockSocketId', emit: jest.fn() } as unknown as Socket;

        gateway.afterInit(mockServer);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    describe('handleCreateRoom', () => {
        it('should call createRoom with correct parameters', () => {
            const mockData = {
                gameId: 'gameId',
                playerName: 'playerName',
                avatar: 'avatar',
                attributes: {
                    health: 4, // maxHealth
                    speed: '4', // maxSpeed
                    attack: 4, // maxAttack
                    defense: 4, // maxDefense
                    dice: '4',
                },
            };
            gateway.handleCreateRoom(mockData, mockSocket);
            expect(matchService.createRoom).toHaveBeenCalledWith(mockServer, mockSocket, '123', {
                playerName: 'testPlayer',
                avatar: 'testAvatar',
                attributes: { speed: 10, strength: 5 },
            });
        });
    });

    describe('handleJoinRoom', () => {
        it('should call joinRoom with correct parameters', () => {
            const mockData = {
                roomId: '123',
                gameId: 'gameId',
                playerName: 'playerName',
                avatar: 'avatar',
                attributes: {
                    health: 4, // maxHealth
                    speed: '4', // maxSpeed
                    attack: 4, // maxAttack
                    defense: 4, // maxDefense
                    dice: '4',
                },
            };
            gateway.handleJoinRoom(mockData, mockSocket);
            expect(matchService.joinRoom).toHaveBeenCalledWith(mockServer, mockSocket, '123', {
                playerName: 'testPlayer',
                avatar: 'testAvatar',
                attributes: { speed: 10, strength: 5 },
            });
        });
    });

    describe('handleValidRoom', () => {
        it('should call isCodeValid with correct parameters', () => {
            const roomId = '123';
            gateway.handleValidRoom(roomId, mockSocket);
            expect(matchService.isCodeValid).toHaveBeenCalledWith(roomId, mockSocket);
        });
    });

    describe('handleIsRoomLocked', () => {
        it('should call isRoomLocked with correct parameters', () => {
            const roomId = '123';
            gateway.handleIsRoomLocked(roomId, mockSocket);
            expect(matchService.isRoomLocked).toHaveBeenCalledWith(roomId, mockSocket);
        });
    });

    describe('handleGetPlayers', () => {
        it('should call getAllPlayersInRoom with correct parameters', () => {
            const roomId = '123';
            gateway.handleGetPlayers(roomId, mockSocket);
            expect(matchService.getAllPlayersInRoom).toHaveBeenCalledWith(roomId, mockSocket);
        });
    });

    describe('handleLeaveRoom', () => {
        it('should call leaveRoom with correct parameters', () => {
            const roomId = '123';
            gateway.handleLeaveRoom(roomId, mockSocket);
            expect(matchService.leaveRoom).toHaveBeenCalledWith(mockServer, mockSocket, roomId);
        });
    });

    describe('handleDisconnect', () => {
        it('should call handleQuitGame and leaveAllRooms', () => {
            gateway.handleDisconnect(mockSocket);
            expect(actionHandlerService.handleQuitGame).toHaveBeenCalledWith(mockServer, mockSocket);
            expect(matchService.leaveAllRooms).toHaveBeenCalledWith(mockServer, mockSocket);
        });
    });

    describe('startGame', () => {
        it('should call startGame with correct parameters', () => {
            const mockData = { roomId: '123' };
            gateway.startGame(mockData, mockSocket);
            expect(matchService.startGame).toHaveBeenCalledWith(mockServer, mockSocket, '123');
        });
    });

    describe('roomMessage', () => {
        it('should call roomMessage with correct parameters', () => {
            const mockData = { roomId: '123', message: 'Hello', date: '2024-01-01' };
            gateway.roomMessage(mockData, mockSocket);
            expect(matchService.roomMessage).toHaveBeenCalledWith(mockServer, mockSocket, '123', 'Hello', '2024-01-01');
        });
    });

    describe('loadAllMessages', () => {
        it('should call loadAllMessages with correct parameters', () => {
            const mockData = { roomId: '123' };
            gateway.loadAllMessages(mockData, mockSocket);
            expect(matchService.loadAllMessages).toHaveBeenCalledWith(mockSocket, '123');
        });
    });
});
