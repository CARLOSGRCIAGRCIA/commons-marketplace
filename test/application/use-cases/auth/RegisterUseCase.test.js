import { registerUseCase } from '../../../../src/application/use-cases/auth/RegisterUseCase.js';
import { AuthDTO } from '../../../../src/application/dtos/users/AuthDTO.js';
import { CreateUserDTO } from '../../../../src/application/dtos/users/CreateUserDTO.js';
import { UserResponseDTO } from '../../../../src/application/dtos/users/UserResponseDTO.js';

describe('RegisterUseCase', () => {
    let authRepository;
    let userRepository;
    let useCase;

    beforeEach(() => {
        authRepository = {
            signUp: jest.fn(),
        };
        userRepository = {
            create: jest.fn(),
        };
        useCase = registerUseCase(authRepository, userRepository);
    });

    it('should register a new user with default buyer role and return a success message', async () => {
        const authDTO = { email: 'test@example.com', password: 'password' };
        const authResponse = { user: { id: 'supabase_id' } };
        const createdUser = {
            _id: 'supabase_id',
            name: null,
            email: 'test@example.com',
            isApprovedSeller: false,
            role: 'buyer',
        };

        authRepository.signUp.mockResolvedValue(authResponse);
        userRepository.create.mockResolvedValue(createdUser);

        const result = await useCase(authDTO);

        expect(authRepository.signUp).toHaveBeenCalledWith(authDTO.email, authDTO.password, {
            data: { role: 'buyer' },
        });
        expect(userRepository.create).toHaveBeenCalledWith(
            CreateUserDTO.from({
                _id: 'supabase_id',
                name: null,
                email: 'test@example.com',
                isApprovedSeller: false,
                role: 'buyer',
            }),
        );
        expect(result).toEqual(AuthDTO.registerResponse(UserResponseDTO.from(createdUser)));
    });

    it('should register a new user with custom role when provided', async () => {
        const authDTO = { email: 'test@example.com', password: 'password', role: 'seller' };
        const authResponse = { user: { id: 'supabase_id' } };
        const createdUser = {
            _id: 'supabase_id',
            name: null,
            email: 'test@example.com',
            isApprovedSeller: false,
            role: 'seller',
        };

        authRepository.signUp.mockResolvedValue(authResponse);
        userRepository.create.mockResolvedValue(createdUser);

        const result = await useCase(authDTO);

        expect(authRepository.signUp).toHaveBeenCalledWith(authDTO.email, authDTO.password, {
            data: { role: 'seller' },
        });
        expect(userRepository.create).toHaveBeenCalledWith(
            CreateUserDTO.from({
                _id: 'supabase_id',
                name: null,
                email: 'test@example.com',
                isApprovedSeller: false,
                role: 'seller',
            }),
        );
        expect(result).toEqual(AuthDTO.registerResponse(UserResponseDTO.from(createdUser)));
    });

    it('should throw an error when signUp fails', async () => {
        const authDTO = { email: 'test@example.com', password: 'password' };
        const error = new Error('Email already in use');
        authRepository.signUp.mockRejectedValue(error);

        await expect(useCase(authDTO)).rejects.toThrow(error);
    });

    it('should throw an error when user creation fails', async () => {
        const authDTO = { email: 'test@example.com', password: 'password' };
        const authResponse = { user: { id: 'supabase_id' } };
        const error = new Error('Could not create user');

        authRepository.signUp.mockResolvedValue(authResponse);
        userRepository.create.mockRejectedValue(error);

        await expect(useCase(authDTO)).rejects.toThrow(error);
    });
});
