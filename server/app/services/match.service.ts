import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

interface Player {
    id: string;
    name: string;
    isAdmin: boolean;
    avatar: string;
}

interface Room {
    gameId: string;
    id: string;
    players: Player[];
    isLocked: boolean;
    maxPlayers: number;
}

@Injectable()
export class MatchService {
    private rooms: Map<string, Room> = new Map();
    private readonly floorRandomNumber: number = 1000;
    private readonly maxValueRandomNumber: number = 8999;

    constructor(private readonly gameService: GameService) {}

    async createRoom(server: Server, client: Socket, gameId: string, playerName: string, avatar: string) {
        const game = await this.gameService.get(gameId);
        if (!game) {
            client.emit('error', 'Game not found');
            return;
        }

        const roomId = this.generateMatchId();

        const mapSize = game.mapSize;
        const maxPlayers = mapSize === '10' ? 2 : mapSize === '15' ? 4 : mapSize === '20' ? 6 : 0;
        const room = { gameId, id: roomId, players: [], isLocked: false, maxPlayers };
        this.rooms.set(roomId, room);

        const player: Player = { id: client.id, name: playerName, isAdmin: true, avatar };
        room.players.push(player);

        console.log(room);
        client.join(roomId);
        client.emit('roomJoined', { roomId: roomId, playerId: client.id });
        this.updatePlayers(server, room);
    }

    isCodeValid(roomId: string, client: Socket) {
        let room = this.rooms.get(roomId);
        if (room && !room.isLocked) client.emit('validRoom', true);
        else client.emit('validRoom', false);
    }

    getAllPlayersInRoom(roomId: string, client: Socket) {
        let room = this.rooms.get(roomId);
        if (room) client.emit('getPlayers', room.players);
    }

    joinRoom(server: Server, client: Socket, roomId: string, playerName: string, avatar: string) {
        const room = this.rooms.get(roomId);

        if (!room) {
            client.emit('error', 'Room not found');
            return;
        }

        if (room.isLocked) {
            client.emit('error', 'Room is locked');
            return;
        }

        const player: Player = { id: client.id, name: playerName, isAdmin: false, avatar };
        room.players.push(player);

        if (room.players.length >= room.maxPlayers) {
            room.isLocked = true;
        }

        console.log(room);
        client.join(roomId);
        client.emit('roomJoined', { roomId: roomId, playerId: client.id });
        this.updatePlayers(server, room);
    }

    updatePlayers(server: Server, room: Room) {
        server.to(room.id).emit('updatePlayers', room.players);
        server.emit('availableAvatars', {
            roomId: room.id,
            avatars: room.players.map((p) => p.avatar),
        });
    }

    leaveRoom(server: Server, client: Socket, roomId: string) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        room.players = room.players.filter((p) => p.id !== client.id);
        client.leave(roomId);

        if (room.players.length === 0) {
            this.rooms.delete(roomId);
        } else {
            server.to(roomId).emit('updatePlayers', room.players);
        }

        console.log(room);

        if (room.players.length === 0) {
            this.rooms.delete(roomId);
        }
    }

    lockRoom(server: Server, client: Socket, roomId: string) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        const player = room.players.find((p) => p.id === client.id);
        if (player && player.isAdmin) {
            room.isLocked = true;
            server.to(roomId).emit('roomLocked');
        }

        console.log(room);
    }

    unlockRoom(server: Server, client: Socket, roomId: string) {
        const room = this.rooms.get(roomId);
        if (!room) return;
        if (room.players.length >= room.maxPlayers) return;

        const player = room.players.find((p) => p.id === client.id);
        if (player && player.isAdmin) {
            room.isLocked = false;
            server.to(roomId).emit('roomUnlocked');
        }

        console.log(room);
    }

    kickPlayer(server: Server, client: Socket, roomId: string, playerId: string) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        const player = room.players.find((p) => p.id === client.id);
        if (player && player.isAdmin) {
            const playerToKick = room.players.find((p) => p.id === playerId);
            if (playerToKick) {
                this.leaveRoom(server, server.sockets.sockets.get(playerId), roomId);
            }
        }
    }

    leaveAllRooms(server: Server, client: Socket) {
        this.rooms.forEach((room, roomId) => {
            if (room.players.some((p) => p.id === client.id)) {
                this.leaveRoom(server, client, roomId);
            }
        });
    }

    generateMatchId() {
        let randomIntInRange: string = Math.floor(this.floorRandomNumber + Math.random() * this.maxValueRandomNumber).toString();
        while (this.rooms.get(randomIntInRange)) {
            randomIntInRange = Math.floor(this.floorRandomNumber + Math.random() * this.maxValueRandomNumber).toString();
        }
        return randomIntInRange;
    }
}
