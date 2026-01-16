import { getConversationMessagesUseCase } from '../../../../src/application/use-cases/chat/GetConversationMessagesUseCase.js';
import { messageResponseDTO } from '../../../../src/application/dtos/messages/index.js';
import { log } from '../../../../src/infrastructure/logger/logger.js';

jest.mock('../../../../src/application/dtos/messages/index.js', () => ({
    messageResponseDTO: jest.fn((msg) => ({ ...msg, formatted: true })),
}));

describe('getConversationMessagesUseCase', () => {
    let messageRepository;
    let getUserBasicInfo;
    let useCase;

    beforeEach(() => {
        messageRepository = {
            findByConversationId: jest.fn(),
        };
        getUserBasicInfo = jest.fn();
        useCase = getConversationMessagesUseCase({
            messageRepository,
            getUserBasicInfo,
        });
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('should return formatted messages for a conversation', async () => {
            const conversationId = 'conv_123';
            const mockMessages = [
                { id: 'msg_1', content: 'Hello', senderId: 'user_123', receiverId: 'user_456' },
                { id: 'msg_2', content: 'Hi', senderId: 'user_456', receiverId: 'user_123' },
            ];
            const mockResult = {
                messages: mockMessages,
                total: 2,
                hasMore: false,
            };

            messageRepository.findByConversationId.mockResolvedValue(mockResult);
            getUserBasicInfo.mockResolvedValue({ id: 'user_123', name: 'Test User' });

            const result = await useCase.execute(conversationId);

            expect(messageRepository.findByConversationId).toHaveBeenCalledWith(conversationId, {});
            expect(messageResponseDTO).toHaveBeenCalledTimes(2);
            expect(result).toEqual({
                messages: [
                    {
                        id: 'msg_1',
                        content: 'Hello',
                        senderId: 'user_123',
                        receiverId: 'user_456',
                        formatted: true,
                    },
                    {
                        id: 'msg_2',
                        content: 'Hi',
                        senderId: 'user_456',
                        receiverId: 'user_123',
                        formatted: true,
                    },
                ],
                total: 2,
                hasMore: false,
            });
            expect(log.debug).toHaveBeenCalledWith(
                'Fetching conversation messages',
                expect.any(Object),
            );
            expect(log.info).toHaveBeenCalledWith(
                'Conversation messages retrieved successfully',
                expect.any(Object),
            );
        });

        it('should pass options to the repository', async () => {
            const conversationId = 'conv_123';
            const options = { limit: 20, skip: 10 };
            const mockResult = {
                messages: [],
                total: 0,
                hasMore: false,
            };

            messageRepository.findByConversationId.mockResolvedValue(mockResult);

            await useCase.execute(conversationId, options);

            expect(messageRepository.findByConversationId).toHaveBeenCalledWith(
                conversationId,
                options,
            );
            expect(log.debug).toHaveBeenCalledWith('Fetching conversation messages', {
                conversationId,
                options,
            });
        });

        it('should handle empty messages array', async () => {
            const conversationId = 'conv_123';
            const mockResult = {
                messages: [],
                total: 0,
                hasMore: false,
            };

            messageRepository.findByConversationId.mockResolvedValue(mockResult);

            const result = await useCase.execute(conversationId);

            expect(result).toEqual({
                messages: [],
                total: 0,
                hasMore: false,
            });
            expect(messageResponseDTO).not.toHaveBeenCalled();
        });

        it('should handle user not found gracefully', async () => {
            const conversationId = 'conv_123';
            const mockMessages = [
                { id: 'msg_1', content: 'Hello', senderId: 'user_123', receiverId: 'user_456' },
            ];
            const mockResult = {
                messages: mockMessages,
                total: 1,
                hasMore: false,
            };

            messageRepository.findByConversationId.mockResolvedValue(mockResult);
            getUserBasicInfo.mockRejectedValue(new Error('User not found'));

            const result = await useCase.execute(conversationId);

            expect(log.warn).toHaveBeenCalledWith('User not found in database', expect.any(Object));
            expect(result.messages).toHaveLength(1);
        });

        it('should throw an error if repository fails', async () => {
            const conversationId = 'conv_123';
            const error = new Error('Database error');

            messageRepository.findByConversationId.mockRejectedValue(error);

            await expect(useCase.execute(conversationId)).rejects.toThrow('Database error');
            expect(log.error).toHaveBeenCalledWith(
                'Error fetching conversation messages',
                expect.any(Object),
            );
        });
    });
});
