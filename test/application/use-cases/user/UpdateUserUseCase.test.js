import { updateUserUseCase } from '../../../../src/application/use-cases/user/UpdateUserUseCase.js';
import { UpdateUserDTO } from '../../../../src/application/dtos/users/UpdateUserDTO.js';
import { UserResponseDTO } from '../../../../src/application/dtos/users/UserResponseDTO.js';

describe('UpdateUserUseCase', () => {
    let userRepository;
    let useCase;

    beforeEach(() => {
        userRepository = {
            updateById: jest.fn(),
        };
        useCase = updateUserUseCase(userRepository);
    });

    it('should update a user and return a user response DTO', async () => {
        const userId = 'test_id';
        const updateUserDTO = { name: 'Updated Name' };
        const updatedUser = { _id: userId, name: 'Updated Name' };

        jest.spyOn(UpdateUserDTO, 'validate').mockReturnValue({ valid: true });
        jest.spyOn(UpdateUserDTO, 'sanitize').mockReturnValue(updateUserDTO);
        userRepository.updateById.mockResolvedValue(updatedUser);

        const result = await useCase(userId, updateUserDTO);

        expect(UpdateUserDTO.validate).toHaveBeenCalledWith(updateUserDTO);
        expect(UpdateUserDTO.sanitize).toHaveBeenCalledWith(updateUserDTO);
        expect(userRepository.updateById).toHaveBeenCalledWith(userId, updateUserDTO);
        expect(result).toEqual(UserResponseDTO.from(updatedUser));
    });

    it('should throw an error if userId is not provided', async () => {
        await expect(useCase(null, {})).rejects.toThrow(
            'A valid user ID must be provided for update',
        );
    });

    it('should throw an error if the update user DTO is invalid', async () => {
        const userId = 'test_id';
        const updateUserDTO = { name: '' };
        const validation = { valid: false, errors: ['Name cannot be empty'] };

        jest.spyOn(UpdateUserDTO, 'validate').mockReturnValue(validation);

        await expect(useCase(userId, updateUserDTO)).rejects.toThrow(validation.errors[0]);
    });

    it('should throw an error if user is not found', async () => {
        const userId = 'non_existent_id';
        const updateUserDTO = { name: 'Updated Name' };

        jest.spyOn(UpdateUserDTO, 'validate').mockReturnValue({ valid: true });
        jest.spyOn(UpdateUserDTO, 'sanitize').mockReturnValue(updateUserDTO);
        userRepository.updateById.mockResolvedValue(null);

        await expect(useCase(userId, updateUserDTO)).rejects.toThrow(
            `User with ID '${userId}' not found for update`,
        );
    });
});
