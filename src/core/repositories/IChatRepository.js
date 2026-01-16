/**
 * Chat Repository Interface
 * @description Defines the contract for real-time chat operations
 */
export const IChatRepository = {
    publishMessage: async (channel, message) => {
        throw new Error('Method not implemented');
    },
    generateTokenRequest: async (userId) => {
        throw new Error('Method not implemented');
    },
    getChannelHistory: async (channelName, options) => {
        throw new Error('Method not implemented');
    },
    getPresence: async (channelName) => {
        throw new Error('Method not implemented');
    },
};
