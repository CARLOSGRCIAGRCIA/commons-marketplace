export const generateChatTokenUseCase = ({ chatRepository }) => {
    const execute = async (userId) => {
        const tokenRequest = await chatRepository.generateTokenRequest(userId);
        return tokenRequest;
    };

    return { execute };
};
