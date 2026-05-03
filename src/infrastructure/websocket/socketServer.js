import { Server } from 'socket.io';
import { log } from '../logger/logger.js';
import { setWebSocketServer } from './socket-instance.js';
import { getEnvironmentConfig } from '../../config/environment.js';

const envConfig = getEnvironmentConfig();

/**
 * WebSocket server for real-time communication.
 */
class WebSocketServer {
    /**
     * Initialize WebSocket server.
     * @param {object} httpServer - HTTP server instance
     */
    constructor(httpServer) {
        setWebSocketServer(this);
        this.io = new Server(httpServer, {
            cors: {
                origin: envConfig.corsOrigins.length > 0 ? envConfig.corsOrigins : true,
                methods: ['GET', 'POST'],
                credentials: true,
            },
            pingTimeout: 60000,
            pingInterval: 25000,
        });

        this.connectedUsers = new Map();
        this.setupEventHandlers();

        log.info('WebSocket server initialized');
    }

    /**
     * Setup WebSocket event handlers.
     */
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            log.debug('Client connected', { socketId: socket.id });

            socket.on('authenticate', (userId) => {
                this.connectedUsers.set(userId, socket.id);
                socket.userId = userId;
                socket.join(`user:${userId}`);
                log.debug('User authenticated', { userId, socketId: socket.id });
            });

            socket.on('join-room', (room) => {
                socket.join(room);
                log.debug('User joined room', { room, socketId: socket.id });
            });

            socket.on('leave-room', (room) => {
                socket.leave(room);
                log.debug('User left room', { room, socketId: socket.id });
            });

            socket.on('typing', (data) => {
                socket.to(data.room).emit('user-typing', {
                    userId: socket.userId,
                    room: data.room,
                });
            });

            socket.on('stop-typing', (data) => {
                socket.to(data.room).emit('user-stop-typing', {
                    userId: socket.userId,
                    room: data.room,
                });
            });

            socket.on('private-message', (data) => {
                const targetSocketId = this.connectedUsers.get(data.targetUserId);
                if (targetSocketId) {
                    this.io.to(targetSocketId).emit('new-message', {
                        from: socket.userId,
                        message: data.message,
                        timestamp: new Date().toISOString(),
                    });
                }
            });

            socket.on('disconnect', () => {
                if (socket.userId) {
                    this.connectedUsers.delete(socket.userId);
                }
                log.debug('Client disconnected', { socketId: socket.id });
            });
        });
    }

    /**
     * Emit event to specific user.
     * @param {string} userId - User ID
     * @param {string} event - Event name
     * @param {any} data - Data to emit
     */
    emitToUser(userId, event, data) {
        const socketId = this.connectedUsers.get(userId);
        if (socketId) {
            this.io.to(socketId).emit(event, data);
        }
    }

    /**
     * Emit event to all connected clients.
     * @param {string} event - Event name
     * @param {any} data - Data to emit
     */
    emitToAll(event, data) {
        this.io.emit(event, data);
    }

    /**
     * Emit event to room.
     * @param {string} room - Room name
     * @param {string} event - Event name
     * @param {any} data - Data to emit
     */
    emitToRoom(room, event, data) {
        this.io.to(room).emit(event, data);
    }

    /**
     * Get connected users count.
     * @returns {number} Number of connected users
     */
    getConnectedUsersCount() {
        return this.connectedUsers.size;
    }

    /**
     * Get all connected users.
     * @returns {string[]} Array of user IDs
     */
    getConnectedUsers() {
        return Array.from(this.connectedUsers.keys());
    }
}

export default WebSocketServer;