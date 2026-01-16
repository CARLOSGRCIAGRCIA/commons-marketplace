import { messageResponseDTO } from '../../dtos/messages/index.js';
import { log } from '../../../infrastructure/logger/logger.js';

export const getConversationMessagesUseCase = ({
    messageRepository,
    userRepository,
    getUserBasicInfo,
}) => {
    const execute = async (conversationId, options = {}) => {
        try {
            log.debug('Fetching conversation messages', { conversationId, options });

            const result = await messageRepository.findByConversationId(conversationId, options);

            const allUserIds = new Set();
            result.messages.forEach((msg) => {
                allUserIds.add(msg.senderId);
                allUserIds.add(msg.receiverId);
            });

            log.debug('Fetching user information', {
                conversationId,
                userCount: allUserIds.size,
            });

            const usersData = {};
            for (const userId of allUserIds) {
                try {
                    const user = await getUserBasicInfo(userId);
                    if (user) {
                        usersData[userId] = user;
                    }
                } catch (error) {
                    log.warn('User not found in database', {
                        userId,
                        conversationId,
                        error: error.message,
                    });
                }
            }

            const enrichedMessages = result.messages.map((message) =>
                messageResponseDTO(
                    message,
                    usersData[message.senderId],
                    usersData[message.receiverId],
                ),
            );

            log.info('Conversation messages retrieved successfully', {
                conversationId,
                messageCount: enrichedMessages.length,
                total: result.total,
                hasMore: result.hasMore,
            });

            return {
                messages: enrichedMessages,
                total: result.total,
                hasMore: result.hasMore,
            };
        } catch (error) {
            log.error('Error fetching conversation messages', {
                conversationId,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    };

    return { execute };
};
