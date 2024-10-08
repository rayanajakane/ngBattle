import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

interface Player {
    id: string;
    name: string;
    isAdmin: boolean;
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

    constructor(private readonly gameService: GameService) {}

    async createRoom(client: Socket, gameId: string, roomId: string, playerName: string) {
        const game = await this.gameService.get(gameId);
        if (!game) {
            client.emit('error', 'Game not found');
            return;
        }
        const mapSize = game.mapSize;
        const maxPlayers = mapSize === '10' ? 2 : mapSize === '15' ? 4 : mapSize === '20' ? 6 : 0;
        const room = { gameId, id: roomId, players: [], isLocked: false, maxPlayers };
        this.rooms.set(roomId, room);

        const player: Player = { id: client.id, name: playerName, isAdmin: true };
        room.players.push(player);

        console.log(room);
        client.join(roomId);
    }

    async joinRoom(server: Server, client: Socket, roomId: string, playerName: string) {
        let room = this.rooms.get(roomId);

        if (!room) {
            client.emit('error', 'Room not found');
            return;
        }

        if (room.isLocked) {
            client.emit('error', 'Room is locked');
            return;
        }

        const player: Player = { id: client.id, name: playerName, isAdmin: false };
        room.players.push(player);

        if (room.players.length >= room.maxPlayers) {
            room.isLocked = true;
        }

        console.log(room);

        client.join(roomId);
        server.to(roomId).emit('updatePlayers', room.players);
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
}
