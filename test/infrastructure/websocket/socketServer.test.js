import WebSocketServer from '../../../src/infrastructure/websocket/socketServer.js';

jest.mock('socket.io', () => {
    return {
        Server: jest.fn().mockImplementation(() => ({
            on: jest.fn(() => {}),
            to: jest.fn().mockReturnValue({
                emit: jest.fn(),
            }),
            emit: jest.fn(),
        })),
    };
});

jest.mock('../../../src/infrastructure/logger/logger.js', () => ({
    log: {
        info: jest.fn(),
        debug: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
    },
}));

describe('WebSocketServer', () => {
    let mockHttpServer;
    let webSocketServer;

    beforeEach(() => {
        mockHttpServer = {};
        webSocketServer = new WebSocketServer(mockHttpServer);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should initialize WebSocket server with http server', () => {
            expect(webSocketServer.io).toBeDefined();
        });

        it('should initialize connectedUsers as empty Map', () => {
            expect(webSocketServer.connectedUsers).toBeInstanceOf(Map);
        });
    });

    describe('emitToUser', () => {
        it('should emit event to specific user', () => {
            const userId = 'user123';
            const event = 'testEvent';
            const data = { message: 'test' };

            webSocketServer.connectedUsers.set(userId, 'socket123');
            webSocketServer.emitToUser(userId, event, data);

            expect(webSocketServer.io.to).toHaveBeenCalledWith('socket123');
        });

        it('should not emit if user not found', () => {
            const userId = 'nonexistent';
            const event = 'testEvent';
            const data = { message: 'test' };

            webSocketServer.emitToUser(userId, event, data);

            expect(webSocketServer.io.to).not.toHaveBeenCalled();
        });
    });

    describe('emitToAll', () => {
        it('should emit event to all clients', () => {
            const event = 'testEvent';
            const data = { message: 'test' };

            webSocketServer.emitToAll(event, data);

            expect(webSocketServer.io.emit).toHaveBeenCalledWith(event, data);
        });
    });

    describe('emitToRoom', () => {
        it('should emit event to room', () => {
            const room = 'testRoom';
            const event = 'testEvent';
            const data = { message: 'test' };

            webSocketServer.emitToRoom(room, event, data);

            expect(webSocketServer.io.to).toHaveBeenCalledWith(room);
        });
    });

    describe('getConnectedUsersCount', () => {
        it('should return number of connected users', () => {
            webSocketServer.connectedUsers.set('user1', 'socket1');
            webSocketServer.connectedUsers.set('user2', 'socket2');

            expect(webSocketServer.getConnectedUsersCount()).toBe(2);
        });

        it('should return 0 when no users connected', () => {
            expect(webSocketServer.getConnectedUsersCount()).toBe(0);
        });
    });

    describe('getConnectedUsers', () => {
        it('should return array of connected user IDs', () => {
            webSocketServer.connectedUsers.set('user1', 'socket1');
            webSocketServer.connectedUsers.set('user2', 'socket2');

            const users = webSocketServer.getConnectedUsers();

            expect(users).toContain('user1');
            expect(users).toContain('user2');
        });

        it('should return empty array when no users connected', () => {
            expect(webSocketServer.getConnectedUsers()).toEqual([]);
        });
    });
});