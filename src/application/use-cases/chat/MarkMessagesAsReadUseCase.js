export const markMessagesAsReadUseCase = ({
    messageRepository,
    conversationRepository,
    chatRepository,
}) => {
    const execute = async (conversationId, userId) => {
        const updatedCount = await messageRepository.markAsRead(conversationId, userId);

        await conversationRepository.resetUnreadCount(conversationId, userId);

        const conversation = await conversationRepository.findById(conversationId);
        const otherParticipantId = conversation.participants.find((p) => p.toString() !== userId);

        if (otherParticipantId) {
            await chatRepository.publishMessage(`private:${otherParticipantId}`, {
                type: 'messages_read',
                conversationId,
                readBy: userId,
            });
        }

        return {
            success: true,
            updatedCount,
        };
    };

    return { execute };
};
