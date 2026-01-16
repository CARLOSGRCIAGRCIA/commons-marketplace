import { CreateUserDTO, UserResponseDTO } from '../../dtos/users/index.js';
import { User } from '../../../core/entities/User.js';

export const createUserUseCase = (userRepository) => async (createUserDTO) => {
    const validation = CreateUserDTO.validate(createUserDTO);
    if (!validation.valid) {
        throw Error(validation.errors[0]);
    }

    const user = User.create(createUserDTO);
    const userValidation = User.validate(user);
    if (!userValidation.valid) {
        throw Error(userValidation.error);
    }

    try {
        const createdUser = await userRepository.create(createUserDTO);
        return UserResponseDTO.from(createdUser);
    } catch (error) {
        if (error.code === 11000 || error.message.includes('already exists')) {
            throw Error(`User with ID '${createUserDTO._id}' already exists`);
        }
        throw error;
    }
};
