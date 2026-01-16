import { generateChatTokenUseCase } from '../../../../src/application/use-cases/chat/GenerateChatTokenUseCase.js';

describe('GenerateChatTokenUseCase', () => {
    let chatRepository;
    let useCase;

    beforeEach(() => {
        chatRepository = {
            generateTokenRequest: jest.fn(),
        };
        useCase = generateChatTokenUseCase({ chatRepository });
    });

    describe('execute', () => {
        it('should generate a chat token for a user', async () => {
            const userId = 'user_123';
            const expectedToken = {
                token: 'token_abc123',
                expiresAt: new Date(),
            };

            chatRepository.generateTokenRequest.mockResolvedValue(expectedToken);

            const result = await useCase.execute(userId);

            expect(chatRepository.generateTokenRequest).toHaveBeenCalledWith(userId);
            expect(result).toEqual(expectedToken);
        });

        it('should throw an error if token generation fails', async () => {
            const userId = 'user_123';
            const error = new Error('Token generation failed');

            chatRepository.generateTokenRequest.mockRejectedValue(error);

            await expect(useCase.execute(userId)).rejects.toThrow('Token generation failed');
            expect(chatRepository.generateTokenRequest).toHaveBeenCalledWith(userId);
        });
    });
});
