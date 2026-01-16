import { sendMessageUseCase } from '../../../../src/application/use-cases/chat/SendMessageUseCase.js';
import { log } from '../../../../src/infrastructure/logger/logger.js';

jest.mock('../../../../src/application/dtos/messages/index.js', () => ({
    messageResponseDTO: jest.fn((msg, sender, receiver) => ({
        ...msg,
        sender,
        receiver,
        formatted: true,
    })),
}));

describe('SendMessageUseCase', () => {
    let messageRepository;
    let conversationRepository;
    let chatRepository;
    let userRepository;
    let getUserBasicInfo;
    let useCase;

    beforeEach(() => {
        messageRepository = {
            create: jest.fn(),
        };
        conversationRepository = {
            findByParticipants: jest.fn(),
            create: jest.fn(),
            updateLastMessage: jest.fn(),
            incrementUnreadCount: jest.fn(),
        };
        chatRepository = {
            publishMessage: jest.fn(),
        };
        userRepository = {
            findById: jest.fn(),
        };
        getUserBasicInfo = jest.fn();

        useCase = sendMessageUseCase({
            messageRepository,
            conversationRepository,
            chatRepository,
            userRepository,
            getUserBasicInfo,
        });
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('should send a message in an existing conversation', async () => {
            const messageData = {
                senderId: 'user_123',
                receiverId: 'user_456',
                content: 'Hello!',
                type: 'text',
                metadata: {},
            };
            const existingConversation = { _id: 'conv_123' };
            const createdMessage = {
                _id: 'msg_123',
                ...messageData,
                conversationId: 'conv_123',
            };
            const senderUser = { id: 'user_123', name: 'Sender' };
            const receiverUser = { id: 'user_456', name: 'Receiver' };

            conversationRepository.findByParticipants.mockResolvedValue(existingConversation);
            messageRepository.create.mockResolvedValue(createdMessage);
            getUserBasicInfo.mockImplementation((userId) => {
                if (userId === 'user_123') return Promise.resolve(senderUser);
                if (userId === 'user_456') return Promise.resolve(receiverUser);
            });
            conversationRepository.updateLastMessage.mockResolvedValue();
            conversationRepository.incrementUnreadCount.mockResolvedValue();
            chatRepository.publishMessage.mockResolvedValue();

            const result = await useCase.execute(messageData);

            expect(conversationRepository.findByParticipants).toHaveBeenCalledWith(
                'user_123',
                'user_456',
            );
            expect(messageRepository.create).toHaveBeenCalledWith({
                conversationId: 'conv_123',
                senderId: 'user_123',
                receiverId: 'user_456',
                content: 'Hello!',
                type: 'text',
                metadata: {},
            });
            expect(getUserBasicInfo).toHaveBeenCalledWith('user_123');
            expect(getUserBasicInfo).toHaveBeenCalledWith('user_456');
            expect(conversationRepository.updateLastMessage).toHaveBeenCalledWith(
                'conv_123',
                'msg_123',
            );
            expect(conversationRepository.incrementUnreadCount).toHaveBeenCalledWith(
                'conv_123',
                'user_456',
            );
            expect(chatRepository.publishMessage).toHaveBeenCalledTimes(2);
            expect(result).toEqual(
                expect.objectContaining({
                    formatted: true,
                    sender: senderUser,
                    receiver: receiverUser,
                }),
            );

            expect(log.info).toHaveBeenCalledWith('Sending message', {
                senderId: 'user_123',
                receiverId: 'user_456',
                type: 'text',
            });
            expect(log.info).toHaveBeenCalledWith('Message sent successfully', {
                messageId: 'msg_123',
                conversationId: 'conv_123',
                senderId: 'user_123',
                receiverId: 'user_456',
            });
        });

        it('should create a new conversation if none exists', async () => {
            const messageData = {
                senderId: 'user_123',
                receiverId: 'user_456',
                content: 'Hello!',
            };
            const newConversation = { _id: 'conv_new' };
            const createdMessage = {
                _id: 'msg_123',
                ...messageData,
                conversationId: 'conv_new',
                type: 'text',
                metadata: {},
            };
            const senderUser = { id: 'user_123', name: 'Sender' };
            const receiverUser = { id: 'user_456', name: 'Receiver' };

            conversationRepository.findByParticipants.mockResolvedValue(null);
            conversationRepository.create.mockResolvedValue(newConversation);
            messageRepository.create.mockResolvedValue(createdMessage);
            getUserBasicInfo.mockImplementation((userId) => {
                if (userId === 'user_123') return Promise.resolve(senderUser);
                if (userId === 'user_456') return Promise.resolve(receiverUser);
            });
            conversationRepository.updateLastMessage.mockResolvedValue();
            conversationRepository.incrementUnreadCount.mockResolvedValue();
            chatRepository.publishMessage.mockResolvedValue();

            const result = await useCase.execute(messageData);

            expect(conversationRepository.create).toHaveBeenCalledWith({
                participants: ['user_123', 'user_456'],
            });
            expect(getUserBasicInfo).toHaveBeenCalledTimes(2);
            expect(result).toEqual(
                expect.objectContaining({
                    formatted: true,
                    sender: senderUser,
                    receiver: receiverUser,
                }),
            );

            expect(log.info).toHaveBeenCalledWith('Creating new conversation', {
                senderId: 'user_123',
                receiverId: 'user_456',
            });
        });

        it('should use default values for type and metadata', async () => {
            const messageData = {
                senderId: 'user_123',
                receiverId: 'user_456',
                content: 'Hello!',
            };
            const existingConversation = { _id: 'conv_123' };
            const createdMessage = {
                _id: 'msg_123',
                conversationId: 'conv_123',
                senderId: 'user_123',
                receiverId: 'user_456',
                content: 'Hello!',
                type: 'text',
                metadata: {},
            };
            const senderUser = { id: 'user_123', name: 'Sender' };
            const receiverUser = { id: 'user_456', name: 'Receiver' };

            conversationRepository.findByParticipants.mockResolvedValue(existingConversation);
            messageRepository.create.mockResolvedValue(createdMessage);
            getUserBasicInfo.mockImplementation((userId) => {
                if (userId === 'user_123') return Promise.resolve(senderUser);
                if (userId === 'user_456') return Promise.resolve(receiverUser);
            });
            conversationRepository.updateLastMessage.mockResolvedValue();
            conversationRepository.incrementUnreadCount.mockResolvedValue();
            chatRepository.publishMessage.mockResolvedValue();

            await useCase.execute(messageData);

            expect(messageRepository.create).toHaveBeenCalledWith({
                conversationId: 'conv_123',
                senderId: 'user_123',
                receiverId: 'user_456',
                content: 'Hello!',
                type: 'text',
                metadata: {},
            });
        });

        it('should handle conversation with id property instead of _id', async () => {
            const messageData = {
                senderId: 'user_123',
                receiverId: 'user_456',
                content: 'Hello!',
            };
            const existingConversation = { id: 'conv_123' };
            const createdMessage = {
                id: 'msg_123',
                conversationId: 'conv_123',
                senderId: 'user_123',
                receiverId: 'user_456',
                content: 'Hello!',
                type: 'text',
                metadata: {},
            };
            const senderUser = { id: 'user_123', name: 'Sender' };
            const receiverUser = { id: 'user_456', name: 'Receiver' };

            conversationRepository.findByParticipants.mockResolvedValue(existingConversation);
            messageRepository.create.mockResolvedValue(createdMessage);
            getUserBasicInfo.mockImplementation((userId) => {
                if (userId === 'user_123') return Promise.resolve(senderUser);
                if (userId === 'user_456') return Promise.resolve(receiverUser);
            });
            conversationRepository.updateLastMessage.mockResolvedValue();
            conversationRepository.incrementUnreadCount.mockResolvedValue();
            chatRepository.publishMessage.mockResolvedValue();

            const result = await useCase.execute(messageData);

            expect(messageRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({ conversationId: 'conv_123' }),
            );
            expect(result).toBeDefined();
        });

        it('should throw an error if conversation ID is not found', async () => {
            const messageData = {
                senderId: 'user_123',
                receiverId: 'user_456',
                content: 'Hello!',
            };
            const invalidConversation = {};

            conversationRepository.findByParticipants.mockResolvedValue(invalidConversation);

            await expect(useCase.execute(messageData)).rejects.toThrow(
                'Failed to get conversation ID',
            );

            expect(log.error).toHaveBeenCalledWith('No conversation ID found', {
                conversation: invalidConversation,
            });
        });

        it('should throw an error if message ID is not found', async () => {
            const messageData = {
                senderId: 'user_123',
                receiverId: 'user_456',
                content: 'Hello!',
            };
            const existingConversation = { _id: 'conv_123' };
            const invalidMessage = { conversationId: 'conv_123', content: 'Hello!' };
            const senderUser = { id: 'user_123', name: 'Sender' };
            const receiverUser = { id: 'user_456', name: 'Receiver' };

            conversationRepository.findByParticipants.mockResolvedValue(existingConversation);
            messageRepository.create.mockResolvedValue(invalidMessage);
            getUserBasicInfo.mockImplementation((userId) => {
                if (userId === 'user_123') return Promise.resolve(senderUser);
                if (userId === 'user_456') return Promise.resolve(receiverUser);
            });

            await expect(useCase.execute(messageData)).rejects.toThrow('Failed to get message ID');

            expect(log.error).toHaveBeenCalledWith('No message ID found after creation');
        });

        it('should throw an error if message creation fails', async () => {
            const messageData = {
                senderId: 'user_123',
                receiverId: 'user_456',
                content: 'Hello!',
            };
            const existingConversation = { _id: 'conv_123' };
            const error = new Error('Database error');

            conversationRepository.findByParticipants.mockResolvedValue(existingConversation);
            messageRepository.create.mockRejectedValue(error);

            await expect(useCase.execute(messageData)).rejects.toThrow('Database error');
        });

        it('should throw an error if conversation creation fails', async () => {
            const messageData = {
                senderId: 'user_123',
                receiverId: 'user_456',
                content: 'Hello!',
            };
            const error = new Error('Failed to create conversation');

            conversationRepository.findByParticipants.mockResolvedValue(null);
            conversationRepository.create.mockRejectedValue(error);

            await expect(useCase.execute(messageData)).rejects.toThrow(
                'Failed to create conversation',
            );
        });

        it('should throw an error if getUserBasicInfo fails', async () => {
            const messageData = {
                senderId: 'user_123',
                receiverId: 'user_456',
                content: 'Hello!',
            };
            const existingConversation = { _id: 'conv_123' };
            const createdMessage = {
                _id: 'msg_123',
                ...messageData,
                conversationId: 'conv_123',
            };
            const error = new Error('User not found');

            conversationRepository.findByParticipants.mockResolvedValue(existingConversation);
            messageRepository.create.mockResolvedValue(createdMessage);
            getUserBasicInfo.mockRejectedValue(error);

            await expect(useCase.execute(messageData)).rejects.toThrow('User not found');
        });
    });
});
