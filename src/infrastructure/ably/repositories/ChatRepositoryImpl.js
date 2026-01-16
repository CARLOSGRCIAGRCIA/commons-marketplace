import { getAblyClient } from '../config/ablyClient.js';

/**
 * Publish message to Ably channel
 * @description Sends a message to a specific Ably channel
 * @param {string} channel - Channel name
 * @param {object} message - Message data
 * @returns {Promise<void>}
 */
export const publishMessage = async (channel, message) => {
    const ably = getAblyClient();
    const ablyChannel = ably.channels.get(channel);
    await ablyChannel.publish('message', message);
};

/**
 * Generate Ably token request
 * @description Creates a token request for client authentication
 * @param {string} userId - User ID
 * @returns {Promise<object>} Token request object
 */
export const generateTokenRequest = async (userId) => {
    const ably = getAblyClient();
    const tokenParams = {
        clientId: userId,
        capability: {
            'chat:*': ['publish', 'subscribe', 'presence'],
            [`private:${userId}`]: ['publish', 'subscribe'],
            [`user:${userId}:conversations`]: ['publish', 'subscribe'],
            [`conversation:*`]: ['subscribe'],
        },
        ttl: 3600000,
    };
    return await ably.auth.createTokenRequest(tokenParams);
};

/**
 * Get channel history
 * @description Retrieves message history from a channel
 * @param {string} channelName - Channel name
 * @param {object} options - Query options
 * @returns {Promise<Array>} Message history
 */
export const getChannelHistory = async (channelName, options = {}) => {
    const ably = getAblyClient();
    const channel = ably.channels.get(channelName);
    const result = await channel.history(options);
    return result.items;
};

/**
 * Get presence information
 * @description Gets current presence data for a channel
 * @param {string} channelName - Channel name
 * @returns {Promise<Array>} Presence data
 */
export const getPresence = async (channelName) => {
    const ably = getAblyClient();
    const channel = ably.channels.get(channelName);
    const presence = await channel.presence.get();
    return presence;
};
