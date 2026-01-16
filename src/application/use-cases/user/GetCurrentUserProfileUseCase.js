import { UserResponseDTO } from '../../dtos/users/UserResponseDTO.js';

export const getCurrentUserProfileUseCase =
    (userRepository, authRepository) => async (userId, authToken) => {
        if (!userId || typeof userId !== 'string' || userId.trim() === '') {
            throw Error('User ID is required');
        }

        const user = await userRepository.findById(userId.trim());
        if (!user) {
            throw Error('User not found');
        }

        const supabaseUser = await authRepository.getUser(authToken);
        if (!supabaseUser) {
            throw Error('Failed to fetch user from auth service');
        }

        return UserResponseDTO.fromWithEmail(user, supabaseUser.email);
    };
