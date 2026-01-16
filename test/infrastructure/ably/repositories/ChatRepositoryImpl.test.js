import {
    publishMessage,
    generateTokenRequest,
    getChannelHistory,
    getPresence,
} from '../../../../src/infrastructure/ably/repositories/ChatRepositoryImpl.js';
import { getAblyClient } from '../../../../src/infrastructure/ably/config/ablyClient.js';

jest.mock('../../../../src/infrastructure/ably/config/ablyClient.js');

describe('Ably Service', () => {
    let mockAblyClient;
    let mockChannel;
    let mockAuth;

    beforeEach(() => {
        mockChannel = {
            publish: jest.fn().mockResolvedValue(undefined),
            history: jest.fn().mockResolvedValue({ items: [] }),
            presence: {
                get: jest.fn().mockResolvedValue([]),
            },
        };

        mockAuth = {
            createTokenRequest: jest.fn().mockResolvedValue({}),
        };

        mockAblyClient = {
            channels: {
                get: jest.fn().mockReturnValue(mockChannel),
            },
            auth: mockAuth,
        };

        getAblyClient.mockReturnValue(mockAblyClient);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('publishMessage', () => {
        it('should publish a message to a channel', async () => {
            const channel = 'chat:123';
            const message = { content: 'Hello World', senderId: 'user_1' };

            await publishMessage(channel, message);

            expect(getAblyClient).toHaveBeenCalled();
            expect(mockAblyClient.channels.get).toHaveBeenCalledWith(channel);
            expect(mockChannel.publish).toHaveBeenCalledWith('message', message);
        });

        it('should handle different channel names', async () => {
            const channel = 'private:user_456';
            const message = { type: 'notification', data: 'test' };

            await publishMessage(channel, message);

            expect(mockAblyClient.channels.get).toHaveBeenCalledWith(channel);
            expect(mockChannel.publish).toHaveBeenCalledWith('message', message);
        });

        it('should throw an error if publish fails', async () => {
            const channel = 'chat:123';
            const message = { content: 'Hello' };
            const error = new Error('Publish failed');

            mockChannel.publish.mockRejectedValue(error);

            await expect(publishMessage(channel, message)).rejects.toThrow('Publish failed');
        });

        it('should handle empty message object', async () => {
            const channel = 'chat:123';
            const message = {};

            await publishMessage(channel, message);

            expect(mockChannel.publish).toHaveBeenCalledWith('message', {});
        });
    });

    describe('generateTokenRequest', () => {
        it('should generate a token request for a user', async () => {
            const userId = 'user_123';
            const expectedTokenRequest = {
                keyName: 'test-key',
                nonce: 'random-nonce',
                mac: 'test-mac',
            };

            mockAuth.createTokenRequest.mockResolvedValue(expectedTokenRequest);

            const result = await generateTokenRequest(userId);

            expect(getAblyClient).toHaveBeenCalled();
            expect(mockAuth.createTokenRequest).toHaveBeenCalledWith({
                clientId: userId,
                capability: {
                    'chat:*': ['publish', 'subscribe', 'presence'],
                    [`private:${userId}`]: ['publish', 'subscribe'],
                    [`user:${userId}:conversations`]: ['publish', 'subscribe'],
                    'conversation:*': ['subscribe'],
                },
                ttl: 3600000,
            });
            expect(result).toEqual(expectedTokenRequest);
        });

        it('should generate token with correct capabilities for different user', async () => {
            const userId = 'user_456';
            const expectedTokenRequest = {
                keyName: 'test-key',
                nonce: 'random-nonce',
                mac: 'test-mac',
            };

            mockAuth.createTokenRequest.mockResolvedValue(expectedTokenRequest);

            await generateTokenRequest(userId);

            expect(mockAuth.createTokenRequest).toHaveBeenCalledWith({
                clientId: userId,
                capability: {
                    'chat:*': ['publish', 'subscribe', 'presence'],
                    'private:user_456': ['publish', 'subscribe'],
                    'user:user_456:conversations': ['publish', 'subscribe'],
                    'conversation:*': ['subscribe'],
                },
                ttl: 3600000,
            });
        });

        it('should include TTL in token request', async () => {
            const userId = 'user_789';

            await generateTokenRequest(userId);

            expect(mockAuth.createTokenRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    ttl: 3600000,
                }),
            );
        });

        it('should include conversation channels in capability', async () => {
            const userId = 'user_123';

            await generateTokenRequest(userId);

            expect(mockAuth.createTokenRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    capability: expect.objectContaining({
                        [`user:${userId}:conversations`]: ['publish', 'subscribe'],
                        'conversation:*': ['subscribe'],
                    }),
                }),
            );
        });

        it('should throw an error if token generation fails', async () => {
            const userId = 'user_123';
            const error = new Error('Token generation failed');

            mockAuth.createTokenRequest.mockRejectedValue(error);

            await expect(generateTokenRequest(userId)).rejects.toThrow('Token generation failed');
        });
    });

    describe('getChannelHistory', () => {
        it('should retrieve channel history without options', async () => {
            const channelName = 'chat:123';
            const mockHistory = [
                { id: 'msg_1', data: 'Hello' },
                { id: 'msg_2', data: 'World' },
            ];

            mockChannel.history.mockResolvedValue({ items: mockHistory });

            const result = await getChannelHistory(channelName);

            expect(getAblyClient).toHaveBeenCalled();
            expect(mockAblyClient.channels.get).toHaveBeenCalledWith(channelName);
            expect(mockChannel.history).toHaveBeenCalledWith({});
            expect(result).toEqual(mockHistory);
        });

        it('should retrieve channel history with options', async () => {
            const channelName = 'chat:456';
            const options = { limit: 50, direction: 'backwards' };
            const mockHistory = [{ id: 'msg_1', data: 'Test' }];

            mockChannel.history.mockResolvedValue({ items: mockHistory });

            const result = await getChannelHistory(channelName, options);

            expect(mockChannel.history).toHaveBeenCalledWith(options);
            expect(result).toEqual(mockHistory);
        });

        it('should return empty array when no history exists', async () => {
            const channelName = 'chat:empty';

            mockChannel.history.mockResolvedValue({ items: [] });

            const result = await getChannelHistory(channelName);

            expect(result).toEqual([]);
        });

        it('should throw an error if history retrieval fails', async () => {
            const channelName = 'chat:123';
            const error = new Error('History retrieval failed');

            mockChannel.history.mockRejectedValue(error);

            await expect(getChannelHistory(channelName)).rejects.toThrow(
                'History retrieval failed',
            );
        });
    });

    describe('getPresence', () => {
        it('should retrieve presence information for a channel', async () => {
            const channelName = 'chat:123';
            const mockPresenceData = [
                { clientId: 'user_1', action: 'enter' },
                { clientId: 'user_2', action: 'enter' },
            ];

            mockChannel.presence.get.mockResolvedValue(mockPresenceData);

            const result = await getPresence(channelName);

            expect(getAblyClient).toHaveBeenCalled();
            expect(mockAblyClient.channels.get).toHaveBeenCalledWith(channelName);
            expect(mockChannel.presence.get).toHaveBeenCalled();
            expect(result).toEqual(mockPresenceData);
        });

        it('should return empty array when no users are present', async () => {
            const channelName = 'chat:empty';

            mockChannel.presence.get.mockResolvedValue([]);

            const result = await getPresence(channelName);

            expect(result).toEqual([]);
        });

        it('should throw an error if presence retrieval fails', async () => {
            const channelName = 'chat:123';
            const error = new Error('Presence retrieval failed');

            mockChannel.presence.get.mockRejectedValue(error);

            await expect(getPresence(channelName)).rejects.toThrow('Presence retrieval failed');
        });

        it('should handle different channel names for presence', async () => {
            const channelName = 'private:user_789';
            const mockPresenceData = [{ clientId: 'user_789', action: 'present' }];

            mockChannel.presence.get.mockResolvedValue(mockPresenceData);

            const result = await getPresence(channelName);

            expect(mockAblyClient.channels.get).toHaveBeenCalledWith(channelName);
            expect(result).toEqual(mockPresenceData);
        });
    });
});
