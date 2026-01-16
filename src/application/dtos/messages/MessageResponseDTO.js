/**
 * Message Response DTO
 * @description Formats message data for API responses with user info
 * @param {object} message - Message entity
 * @param {object} senderData - Sender user data
 * @param {object} receiverData - Receiver user data
 * @returns {object} Formatted message response
 */
export const messageResponseDTO = (message, senderData = null, receiverData = null) => {
    return {
        id: message.id || message._id,
        conversationId: message.conversationId,
        sender: {
            id: message.senderId,
            ...(senderData && {
                name: senderData.name,
                lastName: senderData.lastName,
                profilePicUrl: senderData.profilePicUrl,
                email: senderData.email,
                isApprovedSeller: senderData.isApprovedSeller,
            }),
        },
        receiver: {
            id: message.receiverId,
            ...(receiverData && {
                name: receiverData.name,
                lastName: receiverData.lastName,
                profilePicUrl: receiverData.profilePicUrl,
                email: receiverData.email,
                isApprovedSeller: receiverData.isApprovedSeller,
            }),
        },
        content: message.content,
        type: message.type,
        status: message.status,
        metadata: message.metadata,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
    };
};
