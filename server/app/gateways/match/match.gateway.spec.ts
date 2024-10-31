import { MatchService } from '@app/services/match.service';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Server, Socket } from 'socket.io';
import { MatchGateway } from './match.gateway';

describe('MatchGateway', () => {
    let gateway: MatchGateway;
    let matchService: MatchService;
    let client: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;

    beforeEach(async () => {
        client = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MatchGateway,
                {
                    provide: MatchService,
                    useValue: {
                        leaveAllRooms: jest.fn(),
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
                        roomMessage: jest.fn(),
                        loadAllMessages: jest.fn(),
                    },
                },
            ],
        }).compile();

        gateway = module.get<MatchGateway>(MatchGateway);
        matchService = module.get<MatchService>(MatchService);
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('should initialize server', () => {
        gateway['server'] = null;
        gateway.afterInit(server);
        expect(gateway['server']).toBe(server);
    });

    it('should call leaveAllRooms method of matchService', () => {
        gateway.handleDisconnect(client);
        expect(matchService.leaveAllRooms).toHaveBeenCalledWith(server, client);
    });

    it('should call createRoom method of matchService', () => {
        const data = {
            gameId: 'gameId',
            playerName: 'playerName',
            avatar: 'avatar',
            attributes: { attribute: 'attribute' },
        } as any;
        gateway.handleCreateRoom(data, client);
        expect(matchService.createRoom).toHaveBeenCalledWith(server, client, data.gameId, data.playerName, data.avatar, data.attributes);
    });

    it('should call joinRoom method of matchService', () => {
        const data = {
            roomId: 'roomId',
            playerName: 'playerName',
            avatar: 'avatar',
            attributes: { attribute: 'attribute' },
        } as any;
        gateway.handleJoinRoom(data, client);
        expect(matchService.joinRoom).toHaveBeenCalledWith(server, client, data.roomId, data.playerName, data.avatar, data.attributes);
    });

    it('should call isCodeValid method of matchService', () => {
        const roomId = 'roomId';
        gateway.handleValidRoom(roomId, client);
        expect(matchService.isCodeValid).toHaveBeenCalledWith(roomId, client);
    });

    it('should call isRoomLocked method of matchService', () => {
        const roomId = 'roomId';
        gateway.handleIsRoomLocked(roomId, client);
        expect(matchService.isRoomLocked).toHaveBeenCalledWith(roomId, client);
    });

    it('should call getAllPlayersInRoom method of matchService', () => {
        const roomId = 'roomId';
        gateway.handleGetPlayers(roomId, client);
        expect(matchService.getAllPlayersInRoom).toHaveBeenCalledWith(roomId, client);
    });

    it('should call leaveRoom method of matchService', () => {
        const roomId = 'roomId';
        gateway.handleLeaveRoom(roomId, client);
        expect(matchService.leaveRoom).toHaveBeenCalledWith(server, client, roomId);
    });

    it('should call lockRoom method of matchService', () => {
        const roomId = 'roomId';
        gateway.handleLockRoom(roomId, client);
        expect(matchService.lockRoom).toHaveBeenCalledWith(server, client, roomId);
    });

    it('should call unlockRoom method of matchService', () => {
        const roomId = 'roomId';
        gateway.handleUnlockRoom(roomId, client);
        expect(matchService.unlockRoom).toHaveBeenCalledWith(server, client, roomId);
    });

    it('should call kickPlayer method of matchService', () => {
        const data = { roomId: 'roomId', playerId: 'playerId' } as any;
        gateway.handleKickPlayer(data, client);
        expect(matchService.kickPlayer).toHaveBeenCalledWith(server, client, data.roomId, data.playerId);
    });

    it('should call startGame method of matchService', () => {
        const data = { roomId: 'roomId' } as any;
        gateway.startGame(data, client);
        expect(matchService.startGame).toHaveBeenCalledWith(server, client, data.roomId);
    });

    it('should call roomMessage method of matchService', () => {
        const messageData = { roomId: 'roomId', message: 'message', date: 'date' };
        gateway.roomMessage(messageData, client);
        expect(matchService.roomMessage).toHaveBeenCalledWith(server, client, messageData.roomId, messageData.message, messageData.date);
    });

    it('should call loadAllMessages method of matchService', () => {
        const roomId = 'roomId';
        gateway.loadAllMessages({ roomId }, client);
        expect(matchService.loadAllMessages).toHaveBeenCalledWith(client, roomId);
    });
});
