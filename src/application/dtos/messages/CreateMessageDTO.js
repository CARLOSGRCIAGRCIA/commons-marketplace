export const createMessageDTO = (data) => {
    return {
        conversationId: data.conversationId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        content: data.content,
        type: data.type || 'text',
        metadata: data.metadata || {},
    };
};
