import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

interface Player {
    id: string;
    name: string;
    isAdmin: boolean;
    avatar: string;
    attributes: PlayerAttribute;
}

export interface PlayerAttribute {
    health: string;
    speed: string;
    attack: string;
    defense: string;
}

interface Room {
    gameId: string;
    id: string;
    players: Player[];
    isLocked: boolean;
    maxPlayers: number;
    messages: Message[];
}

interface Message {
    name: string;
    message: string;
    date: string;
}

@Injectable()
export class MatchService {
    private rooms: Map<string, Room> = new Map();
    private readonly floorRandomNumber: number = 1000;
    private readonly maxValueRandomNumber: number = 8999;

    constructor(private readonly gameService: GameService) {}

    async createRoom(server: Server, client: Socket, gameId: string, playerName: string, avatar: string, attributes: PlayerAttribute) {
        const game = await this.getGame(client, gameId);
        const mapSize = game.mapSize;
        const maxPlayers = mapSize === '10' ? 2 : mapSize === '15' ? 4 : mapSize === '20' ? 6 : 0;

        const roomId = this.generateMatchId();
        const room = { gameId, id: roomId, players: [], isLocked: false, maxPlayers, messages: [] };
        this.rooms.set(roomId, room);

        const player: Player = { id: client.id, name: playerName, isAdmin: true, avatar, attributes: attributes };
        room.players.push(player);

        console.log(room);
        client.join(roomId);
        client.emit('roomJoined', { roomId: roomId, playerId: client.id });
        this.updatePlayers(server, room);

        this.loadMessages(client, room);
    }

    isCodeValid(roomId: string, client: Socket) {
        let room = this.rooms.get(roomId);
        if (room && !room.isLocked) client.emit('validRoom', true);
        else client.emit('validRoom', false);
    }

    isRoomLocked(roomId: string, client: Socket) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        client.emit('isRoomLocked', room.isLocked);
    }

    getAllPlayersInRoom(roomId: string, client: Socket) {
        let room = this.rooms.get(roomId);
        if (room) client.emit('getPlayers', room.players);
    }

    joinRoom(server: Server, client: Socket, roomId: string, playerName: string, avatar: string, attributes: PlayerAttribute) {
        const room = this.rooms.get(roomId);

        if (!room) {
            client.emit('error', 'Room not found');
            return;
        }

        if (room.isLocked) {
            client.emit('error', 'Room is locked');
            return;
        }

        const checkedPlayerName = this.checkAndSetPlayerName(room, playerName);

        const player: Player = { id: client.id, name: checkedPlayerName, isAdmin: false, avatar, attributes: attributes };
        room.players.push(player);

        if (room.players.length >= room.maxPlayers) {
            room.isLocked = true;
        }

        console.log(room);
        client.join(roomId);
        client.emit('roomJoined', { roomId: roomId, playerId: client.id });
        this.updatePlayers(server, room);

        this.loadMessages(client, room);
    }

    updatePlayers(server: Server, room: Room) {
        server.to(room.id).emit('updatePlayers', room.players);
        server.emit('availableAvatars', {
            roomId: room.id,
            avatars: room.players.map((p) => p.avatar),
        });
    }

    checkAndSetPlayerName(room: Room, playerName: string) {
        let nameExistsCount = 1;
        while (
            room.players.some((player) => {
                return player.name === playerName;
            })
        ) {
            nameExistsCount++;
            if (nameExistsCount === 2) {
                playerName = playerName + '-2';
                continue;
            }
            playerName = playerName.slice(0, -2) + '-' + nameExistsCount.toString();
        }
        return playerName;
    }

    leaveRoom(server: Server, client: Socket, roomId: string) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        if (client.id === room.players[0].id) {
            room.players.forEach((p) => {
                if (p.id !== client.id) {
                    this.leaveRoom(server, server.sockets.sockets.get(p.id), roomId);
                }
            });
        }

        room.players = room.players.filter((p) => p.id !== client.id);
        client.leave(roomId);
        client.emit('roomLeft');

        if (room.players.length === 0) {
            this.rooms.delete(roomId);
        } else {
            server.to(roomId).emit('updatePlayers', room.players);
        }

        client.disconnect();
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
                server.sockets.sockets.get(playerToKick.id).emit('kicked');
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

    startGame(server: Server, client: Socket, roomId: string) {
        // MaxPlayers is implicitly checked in joinRoom method by locking the room when maxPlayers is reached
        const room = this.rooms.get(roomId);
        if (room.players.length < 2) {
            client.emit('startError', 'Il doit y avoir au moins 2 joueurs pour commencer la partie');
        } else if (!room.isLocked) {
            client.emit('startError', 'La partie doit être vérouillée pour commencer la partie');
        } else {
            server.to(roomId).emit('gameStarted', { gameId: room.gameId, players: room.players });
        }
    }

    async getGame(client: Socket, gameId: string) {
        const game = await this.gameService.get(gameId);
        if (!game) {
            client.emit('error', 'Game not found');
            return;
        }
        return game;
    }

    roomMessage(server: Server, client: Socket, roomId: string, messageString: string, date: string) {
        const room = this.rooms.get(roomId);
        const player = room.players.find((player) => player.id === client.id);

        const message: Message = { name: player.name, message: messageString, date: date };
        room.messages.push(message);

        server.to(roomId).emit('singleMessage', { playerName: player.name, message: message, date: date });
    }

    loadMessages(client: Socket, room: Room) {
        client.emit('loadMessages', { messages: room.messages });
    }
}
