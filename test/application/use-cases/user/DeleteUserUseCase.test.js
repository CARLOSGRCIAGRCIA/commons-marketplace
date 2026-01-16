import { deleteUserUseCase } from '../../../../src/application/use-cases/user/DeleteUserUseCase.js';

describe('DeleteUserUseCase', () => {
    let userRepository;
    let useCase;

    beforeEach(() => {
        userRepository = {
            deleteById: jest.fn(),
        };
        useCase = deleteUserUseCase(userRepository);
    });

    it('should return true when user is deleted successfully', async () => {
        const userId = 'test_id';
        userRepository.deleteById.mockResolvedValue({ _id: userId });

        const result = await useCase(userId);

        expect(userRepository.deleteById).toHaveBeenCalledWith(userId);
        expect(result).toBe(true);
    });

    it('should throw an error if userId is not provided', async () => {
        await expect(useCase(null)).rejects.toThrow(
            'A valid user ID must be provided for deletion',
        );
    });

    it('should throw an error if user is not found', async () => {
        const userId = 'non_existent_id';
        userRepository.deleteById.mockResolvedValue(null);

        await expect(useCase(userId)).rejects.toThrow(
            `User with ID '${userId}' not found for deletion`,
        );
    });
});
