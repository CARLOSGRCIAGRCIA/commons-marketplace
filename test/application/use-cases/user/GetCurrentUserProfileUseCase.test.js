import { getCurrentUserProfileUseCase } from '../../../../src/application/use-cases/user/GetCurrentUserProfileUseCase.js';
import { UserResponseDTO } from '../../../../src/application/dtos/users/UserResponseDTO.js';

describe('GetCurrentUserProfileUseCase', () => {
    let userRepository;
    let authRepository;
    let useCase;

    beforeEach(() => {
        userRepository = {
            findById: jest.fn(),
        };
        authRepository = {
            getUser: jest.fn(),
        };
        useCase = getCurrentUserProfileUseCase(userRepository, authRepository);
    });

    it('should return the user profile with email', async () => {
        const userId = 'test_id';
        const authToken = 'test_token';
        const user = { _id: userId, name: 'Test User' };
        const supabaseUser = { email: 'test@example.com' };

        userRepository.findById.mockResolvedValue(user);
        authRepository.getUser.mockResolvedValue(supabaseUser);

        const result = await useCase(userId, authToken);

        expect(userRepository.findById).toHaveBeenCalledWith(userId);
        expect(authRepository.getUser).toHaveBeenCalledWith(authToken);
        expect(result).toEqual(UserResponseDTO.fromWithEmail(user, supabaseUser.email));
    });

    it('should throw an error if userId is not provided', async () => {
        await expect(useCase(null, 'test_token')).rejects.toThrow('User ID is required');
    });

    it('should throw an error if user is not found', async () => {
        const userId = 'non_existent_id';
        userRepository.findById.mockResolvedValue(null);

        await expect(useCase(userId, 'test_token')).rejects.toThrow('User not found');
    });

    it('should throw an error if supabase user is not found', async () => {
        const userId = 'test_id';
        const user = { _id: userId, name: 'Test User' };
        userRepository.findById.mockResolvedValue(user);
        authRepository.getUser.mockResolvedValue(null);

        await expect(useCase(userId, 'test_token')).rejects.toThrow(
            'Failed to fetch user from auth service',
        );
    });
});
