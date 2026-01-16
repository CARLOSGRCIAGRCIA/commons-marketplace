/**
 * Message entity
 * @description Represents a chat message between users
 * @param {object} data - Message data
 * @returns {object} Message entity
 */

export const createMessage = (data) => {
    const messageId = data.id || data._id;

    return {
        id: messageId,
        _id: data._id || messageId,
        conversationId: data.conversationId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        content: data.content,
        type: data.type || 'text',
        status: data.status || 'sent',
        metadata: data.metadata || {},
        createdAt: data.createdAt || new Date(),
        updatedAt: data.updatedAt || new Date(),
    };
};
