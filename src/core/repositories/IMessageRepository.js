/**
 * Message Repository Interface
 * @description Defines the contract for message data operations
 */
export const IMessageRepository = {
    create: async (messageData) => {
        throw new Error('Method not implemented');
    },
    findById: async (id) => {
        throw new Error('Method not implemented');
    },
    findByConversationId: async (conversationId, options) => {
        throw new Error('Method not implemented');
    },
    updateStatus: async (id, status) => {
        throw new Error('Method not implemented');
    },
    markAsRead: async (conversationId, userId) => {
        throw new Error('Method not implemented');
    },
    delete: async (id) => {
        throw new Error('Method not implemented');
    },
};
