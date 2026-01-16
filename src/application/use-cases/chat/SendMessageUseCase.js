import { messageResponseDTO } from '../../dtos/messages/index.js';
import { log } from '../../../infrastructure/logger/logger.js';

export const sendMessageUseCase = ({
    messageRepository,
    conversationRepository,
    chatRepository,
    userRepository,
    getUserBasicInfo,
}) => {
    /**
     * Execute send message
     * @param {object} messageData - Message data
     * @returns {Promise<object>} Sent message
     */
    const execute = async (messageData) => {
        const { senderId, receiverId, content, type = 'text', metadata = {} } = messageData;

        log.info('Sending message', { senderId, receiverId, type });

        let conversation = await conversationRepository.findByParticipants(senderId, receiverId);

        if (!conversation) {
            log.info('Creating new conversation', { senderId, receiverId });
            conversation = await conversationRepository.create({
                participants: [senderId, receiverId],
            });
        }

        const conversationId = conversation._id || conversation.id;

        if (!conversationId) {
            log.error('No conversation ID found', { conversation });
            throw new Error('Failed to get conversation ID');
        }

        const messageToCreate = {
            conversationId,
            senderId,
            receiverId,
            content,
            type,
            metadata,
        };

        log.debug('Creating message', { conversationId, type });
        const message = await messageRepository.create(messageToCreate);

        const [senderUser, receiverUser] = await Promise.all([
            getUserBasicInfo(senderId),
            getUserBasicInfo(receiverId),
        ]);

        const messageId = message._id || message.id;
        if (!messageId) {
            log.error('No message ID found after creation');
            throw new Error('Failed to get message ID');
        }

        log.debug('Updating conversation metadata', { conversationId, messageId });
        await conversationRepository.updateLastMessage(conversationId, messageId);
        await conversationRepository.incrementUnreadCount(conversationId, receiverId);

        const channelName = `chat:${conversationId.toString()}`;

        const messageDTO = messageResponseDTO(message, senderUser, receiverUser);

        log.debug('Publishing message to channels', { channelName, receiverId });
        await chatRepository.publishMessage(channelName, messageDTO);

        await chatRepository.publishMessage(`private:${receiverId}`, {
            type: 'new_message',
            conversationId: conversationId.toString(),
            message: messageDTO,
        });

        log.info('Message sent successfully', {
            messageId,
            conversationId,
            senderId,
            receiverId,
        });

        return messageDTO;
    };

    return { execute };
};
