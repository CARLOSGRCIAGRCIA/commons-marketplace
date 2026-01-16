import { UpdateUserDTO } from '../../dtos/users/index.js';
import { UserResponseDTO } from '../../dtos/users/index.js';

export const updateUserUseCase = (userRepository) => async (userId, updateUserDTO) => {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        throw Error('A valid user ID must be provided for update');
    }

    const validation = UpdateUserDTO.validate(updateUserDTO);
    if (!validation.valid) {
        throw Error(validation.errors[0]);
    }

    const sanitizedData = UpdateUserDTO.sanitize(updateUserDTO);

    const updatedUser = await userRepository.updateById(userId.trim(), sanitizedData);
    if (!updatedUser) {
        throw Error(`User with ID '${userId}' not found for update`);
    }
    return UserResponseDTO.from(updatedUser);
};
