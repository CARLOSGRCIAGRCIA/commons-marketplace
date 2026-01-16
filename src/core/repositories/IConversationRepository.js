/**
 * Conversation Repository Interface
 * @description Defines the contract for conversation data operations
 */
export const IConversationRepository = {
    create: async (conversationData) => {
        throw new Error('Method not implemented');
    },
    findById: async (id) => {
        throw new Error('Method not implemented');
    },
    findByParticipants: async (participant1Id, participant2Id) => {
        throw new Error('Method not implemented');
    },
    findByUserId: async (userId, options) => {
        throw new Error('Method not implemented');
    },
    updateLastMessage: async (conversationId, messageId) => {
        throw new Error('Method not implemented');
    },
    incrementUnreadCount: async (conversationId, userId) => {
        throw new Error('Method not implemented');
    },
    resetUnreadCount: async (conversationId, userId) => {
        throw new Error('Method not implemented');
    },
    delete: async (id) => {
        throw new Error('Method not implemented');
    },
};
