import { UserResponseDTO } from '../../dtos/users/index.js';

export const getAllUsersUseCase =
    (userRepository) =>
    async (filter = {}, options = {}) => {
        const users = await userRepository.findAll(filter, options);
        return users.map(UserResponseDTO.from);
    };
