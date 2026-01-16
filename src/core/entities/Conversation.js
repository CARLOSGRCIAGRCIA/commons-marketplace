/**
 * Conversation entity
 * @description Represents a conversation between two users
 * @param {object} data - Conversation data
 * @returns {object} Conversation entity
 */
export const createConversation = (data) => {
    return {
        id: data.id || data._id,
        _id: data._id,
        participants: data.participants || [],
        lastMessage: data.lastMessage || null,
        lastMessageAt: data.lastMessageAt || null,
        unreadCount: data.unreadCount || {},
        metadata: data.metadata || {},
        createdAt: data.createdAt || new Date(),
        updatedAt: data.updatedAt || new Date(),
    };
};
