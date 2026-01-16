/**
 * Conversation Response DTO
 * @description Formats conversation data for API responses with participant info
 * @param {object} conversation - Conversation entity
 * @param {string} currentUserId - Current user ID for unread count
 * @param {object} participantsData - Participants user data
 * @returns {object} Formatted conversation response
 */
export const conversationResponseDTO = (conversation, currentUserId, participantsData = {}) => {
    const unreadCount = conversation.unreadCount
        ? conversation.unreadCount.get
            ? conversation.unreadCount.get(currentUserId) || 0
            : conversation.unreadCount[currentUserId] || 0
        : 0;

    const enrichedParticipants = conversation.participants.map((participantId) => ({
        id: participantId,
        ...(participantsData[participantId] && {
            name: participantsData[participantId].name,
            lastName: participantsData[participantId].lastName,
            profilePicUrl: participantsData[participantId].profilePicUrl,
            email: participantsData[participantId].email,
            isApprovedSeller: participantsData[participantId].isApprovedSeller,
        }),
    }));

    return {
        id: conversation.id || conversation._id,
        participants: enrichedParticipants,
        lastMessage: conversation.lastMessage,
        lastMessageAt: conversation.lastMessageAt,
        unreadCount,
        metadata: conversation.metadata,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
    };
};
