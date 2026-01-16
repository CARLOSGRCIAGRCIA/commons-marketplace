import { getUserConversationsUseCase } from '../../../../src/application/use-cases/chat/GetUserConversationsUseCase.js';
import { conversationResponseDTO } from '../../../../src/application/dtos/conversations/index.js';
import { log } from '../../../../src/infrastructure/logger/logger.js';

jest.mock('../../../../src/application/dtos/conversations/index.js', () => ({
    conversationResponseDTO: jest.fn((conv, userId, participantsData) => ({
        ...conv,
        userId,
        participantsData,
        formatted: true,
    })),
}));

jest.mock('../../../../src/infrastructure/logger/logger.js', () => ({
    log: {
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
        http: jest.fn(),
        debug: jest.fn(),
    },
}));

describe('GetUserConversationsUseCase', () => {
    let conversationRepository;
    let userRepository;
    let getUserBasicInfo;
    let useCase;

    beforeEach(() => {
        conversationRepository = {
            findByUserId: jest.fn(),
        };
        userRepository = {
            findById: jest.fn(),
        };
        getUserBasicInfo = jest.fn();

        const factory = getUserConversationsUseCase({
            conversationRepository,
            userRepository,
            getUserBasicInfo,
        });
        useCase = factory;
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('should return formatted conversations for a user with participant data', async () => {
            const userId = 'user_123';
            const mockConversations = [
                { id: 'conv_1', participants: ['user_123', 'user_456'] },
                { id: 'conv_2', participants: ['user_123', 'user_789'] },
            ];
            const mockResult = {
                conversations: mockConversations,
                total: 2,
                hasMore: false,
            };
            const user456 = { id: 'user_456', name: 'User 456' };
            const user789 = { id: 'user_789', name: 'User 789' };

            conversationRepository.findByUserId.mockResolvedValue(mockResult);
            getUserBasicInfo.mockImplementation((id) => {
                if (id === 'user_456') return Promise.resolve(user456);
                if (id === 'user_789') return Promise.resolve(user789);
                return Promise.resolve(null);
            });

            const result = await useCase.execute(userId);

            expect(conversationRepository.findByUserId).toHaveBeenCalledWith(userId, {});
            expect(getUserBasicInfo).toHaveBeenCalledTimes(2);
            expect(getUserBasicInfo).toHaveBeenCalledWith('user_456');
            expect(getUserBasicInfo).toHaveBeenCalledWith('user_789');
            expect(conversationResponseDTO).toHaveBeenCalledTimes(2);
            expect(conversationResponseDTO).toHaveBeenCalledWith(mockConversations[0], userId, {
                user_456: user456, // eslint-disable-line camelcase
                user_789: user789, // eslint-disable-line camelcase
            });
            expect(conversationResponseDTO).toHaveBeenCalledWith(mockConversations[1], userId, {
                user_456: user456, // eslint-disable-line camelcase
                user_789: user789, // eslint-disable-line camelcase
            });
            expect(log.debug).toHaveBeenCalledWith('User conversations retrieved', {
                userId,
                count: 2,
            });
            expect(result).toEqual({
                conversations: [
                    {
                        id: 'conv_1',
                        participants: ['user_123', 'user_456'],
                        userId,
                        participantsData: {
                            user_456: user456, // eslint-disable-line camelcase
                            user_789: user789, // eslint-disable-line camelcase
                        },
                        formatted: true,
                    },
                    {
                        id: 'conv_2',
                        participants: ['user_123', 'user_789'],
                        userId,
                        participantsData: {
                            user_456: user456, // eslint-disable-line camelcase
                            user_789: user789, // eslint-disable-line camelcase
                        },
                        formatted: true,
                    },
                ],
                total: 2,
                hasMore: false,
            });
        });

        it('should exclude the current user from participants data', async () => {
            const userId = 'user_123';
            const mockConversations = [{ id: 'conv_1', participants: ['user_123', 'user_456'] }];
            const mockResult = {
                conversations: mockConversations,
                total: 1,
                hasMore: false,
            };
            const user456 = { id: 'user_456', name: 'User 456' };

            conversationRepository.findByUserId.mockResolvedValue(mockResult);
            getUserBasicInfo.mockResolvedValue(user456);

            await useCase.execute(userId);

            expect(getUserBasicInfo).toHaveBeenCalledTimes(1);
            expect(getUserBasicInfo).toHaveBeenCalledWith('user_456');
            expect(getUserBasicInfo).not.toHaveBeenCalledWith('user_123');
        });

        it('should handle duplicate participants across conversations', async () => {
            const userId = 'user_123';
            const mockConversations = [
                { id: 'conv_1', participants: ['user_123', 'user_456'] },
                { id: 'conv_2', participants: ['user_123', 'user_456'] },
            ];
            const mockResult = {
                conversations: mockConversations,
                total: 2,
                hasMore: false,
            };
            const user456 = { id: 'user_456', name: 'User 456' };

            conversationRepository.findByUserId.mockResolvedValue(mockResult);
            getUserBasicInfo.mockResolvedValue(user456);

            await useCase.execute(userId);

            expect(getUserBasicInfo).toHaveBeenCalledTimes(1);
            expect(getUserBasicInfo).toHaveBeenCalledWith('user_456');
        });

        it('should handle getUserBasicInfo returning null', async () => {
            const userId = 'user_123';
            const mockConversations = [{ id: 'conv_1', participants: ['user_123', 'user_456'] }];
            const mockResult = {
                conversations: mockConversations,
                total: 1,
                hasMore: false,
            };

            conversationRepository.findByUserId.mockResolvedValue(mockResult);
            getUserBasicInfo.mockResolvedValue(null);

            const result = await useCase.execute(userId);

            expect(getUserBasicInfo).toHaveBeenCalledWith('user_456');
            expect(conversationResponseDTO).toHaveBeenCalledWith(mockConversations[0], userId, {});
            expect(result.conversations).toHaveLength(1);
        });

        it('should handle getUserBasicInfo throwing an error', async () => {
            const userId = 'user_123';
            const mockConversations = [
                { id: 'conv_1', participants: ['user_123', 'user_456'] },
                { id: 'conv_2', participants: ['user_123', 'user_789'] },
            ];
            const mockResult = {
                conversations: mockConversations,
                total: 2,
                hasMore: false,
            };
            const user789 = { id: 'user_789', name: 'User 789' };

            conversationRepository.findByUserId.mockResolvedValue(mockResult);
            getUserBasicInfo.mockImplementation((id) => {
                if (id === 'user_456') return Promise.reject(new Error('User not found'));
                if (id === 'user_789') return Promise.resolve(user789);
                return Promise.resolve(null);
            });

            const result = await useCase.execute(userId);

            expect(log.warn).toHaveBeenCalledWith('User not found in database', {
                participantId: 'user_456',
                error: 'User not found',
            });
            expect(conversationResponseDTO).toHaveBeenCalledWith(expect.anything(), userId, {
                user_789: user789, // eslint-disable-line camelcase
            });
            expect(result.conversations).toHaveLength(2);
        });

        it('should pass options to the repository', async () => {
            const userId = 'user_123';
            const options = { limit: 20, skip: 10 };
            const mockResult = {
                conversations: [],
                total: 0,
                hasMore: false,
            };

            conversationRepository.findByUserId.mockResolvedValue(mockResult);

            await useCase.execute(userId, options);

            expect(conversationRepository.findByUserId).toHaveBeenCalledWith(userId, options);
        });

        it('should handle empty conversations array', async () => {
            const userId = 'user_123';
            const mockResult = {
                conversations: [],
                total: 0,
                hasMore: false,
            };

            conversationRepository.findByUserId.mockResolvedValue(mockResult);

            const result = await useCase.execute(userId);

            expect(result).toEqual({
                conversations: [],
                total: 0,
                hasMore: false,
            });
            expect(getUserBasicInfo).not.toHaveBeenCalled();
            expect(conversationResponseDTO).not.toHaveBeenCalled();
        });

        it('should handle conversations with multiple participants', async () => {
            const userId = 'user_123';
            const mockConversations = [
                { id: 'conv_1', participants: ['user_123', 'user_456', 'user_789', 'user_999'] },
            ];
            const mockResult = {
                conversations: mockConversations,
                total: 1,
                hasMore: false,
            };
            const user456 = { id: 'user_456', name: 'User 456' };
            const user789 = { id: 'user_789', name: 'User 789' };
            const user999 = { id: 'user_999', name: 'User 999' };

            conversationRepository.findByUserId.mockResolvedValue(mockResult);
            getUserBasicInfo.mockImplementation((id) => {
                if (id === 'user_456') return Promise.resolve(user456);
                if (id === 'user_789') return Promise.resolve(user789);
                if (id === 'user_999') return Promise.resolve(user999);
                return Promise.resolve(null);
            });

            await useCase.execute(userId);

            expect(getUserBasicInfo).toHaveBeenCalledTimes(3);
            expect(getUserBasicInfo).toHaveBeenCalledWith('user_456');
            expect(getUserBasicInfo).toHaveBeenCalledWith('user_789');
            expect(getUserBasicInfo).toHaveBeenCalledWith('user_999');
            expect(conversationResponseDTO).toHaveBeenCalledWith(mockConversations[0], userId, {
                user_456: user456, // eslint-disable-line camelcase
                user_789: user789, // eslint-disable-line camelcase
                user_999: user999, // eslint-disable-line camelcase
            });
        });

        it('should throw an error if repository fails', async () => {
            const userId = 'user_123';
            const error = new Error('Database error');

            conversationRepository.findByUserId.mockRejectedValue(error);

            await expect(useCase.execute(userId)).rejects.toThrow('Database error');
            expect(log.error).toHaveBeenCalledWith('Failed to get user conversations', {
                userId,
                error: 'Database error',
            });
        });
    });
});
