import { conversationResponseDTO } from '../../dtos/conversations/index.js';
import { log } from '../../../infrastructure/logger/logger.js';

export const getUserConversationsUseCase = ({
    conversationRepository,
    userRepository,
    getUserBasicInfo,
}) => {
    const execute = async (userId, options = {}) => {
        try {
            const result = await conversationRepository.findByUserId(userId, options);

            const allParticipantIds = new Set();
            result.conversations.forEach((conv) => {
                conv.participants.forEach((participantId) => {
                    if (participantId !== userId) {
                        allParticipantIds.add(participantId);
                    }
                });
            });

            const participantsData = {};
            for (const participantId of allParticipantIds) {
                try {
                    const user = await getUserBasicInfo(participantId);
                    if (user) {
                        participantsData[participantId] = user;
                    }
                } catch (error) {
                    log.warn('User not found in database', { participantId, error: error.message });
                }
            }

            const enrichedConversations = result.conversations.map((conv) =>
                conversationResponseDTO(conv, userId, participantsData),
            );

            log.debug('User conversations retrieved', {
                userId,
                count: enrichedConversations.length,
            });

            return {
                conversations: enrichedConversations,
                total: result.total,
                hasMore: result.hasMore,
            };
        } catch (error) {
            log.error('Failed to get user conversations', { userId, error: error.message });
            throw error;
        }
    };

    return { execute };
};
