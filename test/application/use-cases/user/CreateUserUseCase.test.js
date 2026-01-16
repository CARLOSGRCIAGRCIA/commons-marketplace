import { createUserUseCase } from '../../../../src/application/use-cases/user/CreateUserUseCase.js';
import { CreateUserDTO } from '../../../../src/application/dtos/users/CreateUserDTO.js';
import { UserResponseDTO } from '../../../../src/application/dtos/users/UserResponseDTO.js';
import { User } from '../../../../src/core/entities/User.js';

describe('CreateUserUseCase', () => {
    let userRepository;
    let useCase;

    beforeEach(() => {
        userRepository = {
            create: jest.fn(),
        };
        useCase = createUserUseCase(userRepository);
    });

    it('should create a user and return a user response DTO', async () => {
        const createUserDTO = { _id: 'test_id', name: 'Test User' };
        const createdUser = { _id: 'test_id', name: 'Test User' };

        jest.spyOn(CreateUserDTO, 'validate').mockReturnValue({ valid: true });
        jest.spyOn(User, 'create').mockReturnValue(createdUser);
        jest.spyOn(User, 'validate').mockReturnValue({ valid: true });
        userRepository.create.mockResolvedValue(createdUser);

        const result = await useCase(createUserDTO);

        expect(CreateUserDTO.validate).toHaveBeenCalledWith(createUserDTO);
        expect(User.create).toHaveBeenCalledWith(createUserDTO);
        expect(User.validate).toHaveBeenCalledWith(createdUser);
        expect(userRepository.create).toHaveBeenCalledWith(createUserDTO);
        expect(result).toEqual(UserResponseDTO.from(createdUser));
    });

    it('should throw an error if the create user DTO is invalid', async () => {
        const createUserDTO = { _id: 'test_id' };
        const validation = { valid: false, errors: ['Name is required'] };

        jest.spyOn(CreateUserDTO, 'validate').mockReturnValue(validation);

        await expect(useCase(createUserDTO)).rejects.toThrow(validation.errors[0]);
    });

    it('should throw an error if the user entity is invalid', async () => {
        const createUserDTO = { _id: 'test_id', name: 'Test User' };
        const user = { _id: 'test_id', name: 'Test User' };
        const validation = { valid: false, error: 'Invalid user' };

        jest.spyOn(CreateUserDTO, 'validate').mockReturnValue({ valid: true });
        jest.spyOn(User, 'create').mockReturnValue(user);
        jest.spyOn(User, 'validate').mockReturnValue(validation);

        await expect(useCase(createUserDTO)).rejects.toThrow(validation.error);
    });

    it('should throw an error if the user already exists', async () => {
        const createUserDTO = { _id: 'test_id', name: 'Test User' };
        const error = new Error(`User with ID '${createUserDTO._id}' already exists`);
        error.code = 11000;

        jest.spyOn(CreateUserDTO, 'validate').mockReturnValue({ valid: true });
        jest.spyOn(User, 'create').mockReturnValue(createUserDTO);
        jest.spyOn(User, 'validate').mockReturnValue({ valid: true });
        userRepository.create.mockRejectedValue(error);

        await expect(useCase(createUserDTO)).rejects.toThrow(error);
    });
});
