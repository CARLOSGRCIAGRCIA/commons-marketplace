import { getUserByIdUseCase } from '../../../../src/application/use-cases/user/GetUserByIdUseCase.js';
import { UserResponseDTO } from '../../../../src/application/dtos/users/UserResponseDTO.js';

describe('GetUserByIdUseCase', () => {
    let userRepository;
    let useCase;

    beforeEach(() => {
        userRepository = {
            findById: jest.fn(),
        };
        useCase = getUserByIdUseCase(userRepository);
    });

    it('should return a user response DTO when user is found', async () => {
        const userId = 'test_id';
        const user = { _id: userId, name: 'Test User' };
        userRepository.findById.mockResolvedValue(user);

        const result = await useCase(userId);

        expect(userRepository.findById).toHaveBeenCalledWith(userId);
        expect(result).toEqual(UserResponseDTO.from(user));
    });

    it('should throw an error if userId is not provided', async () => {
        await expect(useCase(null)).rejects.toThrow('A valid user ID must be provided');
    });

    it('should throw an error if user is not found', async () => {
        const userId = 'non_existent_id';
        userRepository.findById.mockResolvedValue(null);

        await expect(useCase(userId)).rejects.toThrow(`User with ID '${userId}' not found`);
    });
});
