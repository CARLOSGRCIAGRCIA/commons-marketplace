import { UserResponseDTO } from '../../dtos/users/index.js';

export const getUserByIdUseCase = (userRepository) => async (userId) => {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        throw Error('A valid user ID must be provided');
    }

    const user = await userRepository.findById(userId.trim());
    if (!user) {
        throw Error(`User with ID '${userId}' not found`);
    }

    return UserResponseDTO.from(user);
};
