import supabase from '../../../src/infrastructure/supabase/config/supabaseClient.js';
import {
    badRequestException,
    internalServerError,
    notFoundException,
} from '../../../src/presentation/exceptions/index.js';
import { UserRepositoryImpl as UserRepository } from '../../../src/infrastructure/database/mongo/repositories/userRepository.js';
import * as UserService from '../../../src/core/services/userService.js';
import { log } from '../../../src/infrastructure/logger/logger.js';

jest.mock('../../../src/infrastructure/database/mongo/repositories/userRepository.js', () => ({
    UserRepositoryImpl: {
        create: jest.fn(),
        findById: jest.fn(),
        findAll: jest.fn(),
        updateById: jest.fn(),
        deleteById: jest.fn(),
    },
}));

jest.mock('../../../src/infrastructure/supabase/config/supabaseClient.js', () => ({
    __esModule: true,
    default: {
        auth: {
            getUser: jest.fn(),
        },
    },
}));

jest.mock('../../../src/infrastructure/logger/logger.js', () => ({
    log: {
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
        http: jest.fn(),
        debug: jest.fn(),
    },
}));

const mockUserId = 'usr_test123';
const mockUserData = {
    _id: mockUserId,
    name: 'Test',
    lastName: 'User',
    phoneNumber: '+1234567890',
    address: '123 Main St, City',
    profilePicUrl: 'http://example.com/pic.jpg',
    email: 'test@example.com',
    isApprovedSeller: false,
};
const mockCreatedUser = {
    ...mockUserData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};
const mockUpdatedUser = {
    ...mockCreatedUser,
    name: 'Updated Test',
    lastName: 'User Jr',
    phoneNumber: '+1987654321',
    address: '456 Oak Ave, Town',
    updatedAt: new Date().toISOString(),
};
const mockToken = 'valid_token_123';
const mockSupabaseUser = {
    email: 'test.user@example.com',
    id: mockUserId,
};
const expectedProfileResponse = {
    name: mockUserData.name,
    lastName: mockUserData.lastName,
    phoneNumber: mockUserData.phoneNumber,
    address: mockUserData.address,
    profilePicUrl: mockUserData.profilePicUrl,
    email: mockSupabaseUser.email,
};

describe('UserService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createUser', () => {
        it('should successfully create a user with all fields', async () => {
            UserRepository.create.mockResolvedValue(mockCreatedUser);

            const result = await UserService.createUser(mockUserData);

            expect(UserRepository.create).toHaveBeenCalledWith({
                _id: mockUserId,
                name: mockUserData.name,
                lastName: mockUserData.lastName,
                phoneNumber: mockUserData.phoneNumber,
                address: mockUserData.address,
                profilePicUrl: mockUserData.profilePicUrl,
                email: mockUserData.email,
                isApprovedSeller: mockUserData.isApprovedSeller,
            });
            expect(log.info).toHaveBeenCalledWith('User created successfully', {
                userId: mockCreatedUser._id,
            });
            expect(result).toEqual(mockCreatedUser);
        });

        it('should create user with email when provided', async () => {
            const userWithEmail = {
                ...mockUserData,
                email: 'test@example.com',
            };
            UserRepository.create.mockResolvedValue({
                ...mockCreatedUser,
                email: 'test@example.com',
            });

            const result = await UserService.createUser(userWithEmail);

            expect(UserRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    email: 'test@example.com',
                }),
            );
            expect(result.email).toBe('test@example.com');
        });

        it('should throw BadRequestException if _id is missing', async () => {
            const invalidData = { name: 'No ID User' };

            await expect(UserService.createUser(invalidData)).rejects.toThrow(
                badRequestException('User ID (_id) is required and must be a non-empty string.'),
            );
            expect(UserRepository.create).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException for duplicate _id', async () => {
            const duplicateError = new Error('Duplicate key error');
            duplicateError.code = 11000;
            UserRepository.create.mockRejectedValue(duplicateError);

            await expect(UserService.createUser(mockUserData)).rejects.toThrow(
                badRequestException(`A record with this _id ('${mockUserId}') already exists.`),
            );
            expect(log.warn).toHaveBeenCalledWith('Attempt to create duplicate user', {
                userId: mockUserId,
            });
        });

        it('should throw BadRequestException for validation errors', async () => {
            const validationError = new Error('Validation failed');
            validationError.name = 'ValidationError';
            validationError.errors = { name: { message: 'Name is required' } };
            UserRepository.create.mockRejectedValue(validationError);

            await expect(UserService.createUser(mockUserData)).rejects.toThrow(
                badRequestException('Validation failed: Name is required'),
            );
            expect(log.error).toHaveBeenCalledWith('User validation failed', {
                userId: mockUserId,
                error: 'Name is required',
            });
        });

        it('should throw InternalServerError for unexpected errors', async () => {
            UserRepository.create.mockRejectedValue(new Error('DB Error'));

            await expect(UserService.createUser(mockUserData)).rejects.toThrow(
                internalServerError('Failed to create user'),
            );
            expect(log.error).toHaveBeenCalledWith('Failed to create user', {
                userId: mockUserId,
                error: 'DB Error',
            });
        });

        it('should set optional fields to null when not provided', async () => {
            const input = { _id: 'abc123' };

            const expected = {
                _id: 'abc123',
                name: null,
                lastName: null,
                phoneNumber: null,
                address: null,
                profilePicUrl: undefined,
                email: null,
            };

            UserRepository.create.mockResolvedValue(expected);

            const result = await UserService.createUser(input);

            expect(UserRepository.create).toHaveBeenCalledWith(expected);
            expect(result).toEqual(expected);
        });

        it('should fallback to error.message if validationMessage is missing', async () => {
            const validationError = {
                name: 'ValidationError',
                message: 'Generic validation failure',
                errors: {},
            };

            UserRepository.create.mockRejectedValue(validationError);

            await expect(UserService.createUser(mockUserData)).rejects.toThrow(
                badRequestException('Validation failed: Generic validation failure'),
            );
        });
    });

    describe('getAllUsers', () => {
        it('should return an array of users with all fields', async () => {
            const mockUsers = [
                mockCreatedUser,
                { ...mockCreatedUser, _id: 'usr_another123', name: 'Another' },
            ];
            UserRepository.findAll.mockResolvedValue(mockUsers);

            const result = await UserService.getAllUsers();

            expect(result).toEqual(mockUsers);
            expect(UserRepository.findAll).toHaveBeenCalledTimes(1);
            expect(log.debug).toHaveBeenCalledWith('Retrieved all users', { count: 2 });
        });

        it('should throw InternalServerError if repository fails', async () => {
            UserRepository.findAll.mockRejectedValue(new Error('DB Error'));

            await expect(UserService.getAllUsers()).rejects.toThrow(
                internalServerError('Failed to retrieve users.'),
            );
            expect(log.error).toHaveBeenCalledWith('Failed to retrieve users', {
                error: 'DB Error',
            });
        });
    });

    describe('getUserById', () => {
        it('should return user data with all fields when found', async () => {
            UserRepository.findById.mockResolvedValue(mockCreatedUser);

            const result = await UserService.getUserById(mockUserId);

            expect(result).toEqual(mockCreatedUser);
            expect(UserRepository.findById).toHaveBeenCalledWith(mockUserId);
            expect(log.debug).toHaveBeenCalledWith('User retrieved successfully', {
                userId: mockUserId,
            });
        });

        it('should throw BadRequestException for invalid ID format', async () => {
            await expect(UserService.getUserById('  ')).rejects.toThrow(
                badRequestException('A valid user ID must be provided.'),
            );
        });

        it('should throw NotFoundException when user not found', async () => {
            UserRepository.findById.mockResolvedValue(null);

            await expect(UserService.getUserById(mockUserId)).rejects.toThrow(
                notFoundException(`User with ID '${mockUserId}' not found.`),
            );
            expect(log.warn).toHaveBeenCalledWith('User not found', { userId: mockUserId });
        });

        it('should throw InternalServerError for repository errors', async () => {
            UserRepository.findById.mockRejectedValue(new Error('DB Error'));

            await expect(UserService.getUserById(mockUserId)).rejects.toThrow(
                internalServerError(`Failed to retrieve user '${mockUserId}'.`),
            );
            expect(log.error).toHaveBeenCalledWith('Failed to retrieve user', {
                userId: mockUserId,
                error: 'DB Error',
            });
        });
    });

    describe('getUserBasicInfo', () => {
        it('should return complete basic info when user exists', async () => {
            const mockUser = {
                _id: mockUserId,
                name: 'Test',
                lastName: 'User',
                profilePicUrl: 'http://example.com/pic.jpg',
                email: 'test@example.com',
                isApprovedSeller: true,
            };
            UserRepository.findById.mockResolvedValue(mockUser);

            const result = await UserService.getUserBasicInfo(mockUserId);

            expect(result).toEqual({
                id: mockUserId,
                name: 'Test',
                lastName: 'User',
                profilePicUrl: 'http://example.com/pic.jpg',
                email: 'test@example.com',
                isApprovedSeller: true,
            });
            expect(UserRepository.findById).toHaveBeenCalledWith(mockUserId);
        });

        it('should use default name "Usuario" when user not found', async () => {
            UserRepository.findById.mockResolvedValue(null);

            const result = await UserService.getUserBasicInfo('nonexistent_id');

            expect(result).toEqual({
                id: 'nonexistent_id',
                name: 'Usuario',
                lastName: '',
                profilePicUrl: null,
                email: null,
                isApprovedSeller: false,
            });
            expect(log.warn).toHaveBeenCalledWith('User not found, returning default info', {
                userId: 'nonexistent_id',
            });
        });

        it('should return default values for invalid ID', async () => {
            const result = await UserService.getUserBasicInfo('');

            expect(result).toEqual({
                id: '',
                name: 'User',
                lastName: '',
                profilePicUrl: null,
                email: null,
                isApprovedSeller: false,
            });
            expect(UserRepository.findById).not.toHaveBeenCalled();
        });

        it('should return default values for null ID', async () => {
            const result = await UserService.getUserBasicInfo(null);

            expect(result).toEqual({
                id: null,
                name: 'User',
                lastName: '',
                profilePicUrl: null,
                email: null,
                isApprovedSeller: false,
            });
            expect(UserRepository.findById).not.toHaveBeenCalled();
        });

        it('should handle user with missing optional fields', async () => {
            const mockUser = {
                _id: mockUserId,
                name: null,
                lastName: null,
                profilePicUrl: null,
                email: null,
                isApprovedSeller: false,
            };
            UserRepository.findById.mockResolvedValue(mockUser);

            const result = await UserService.getUserBasicInfo(mockUserId);

            expect(result).toEqual({
                id: mockUserId,
                name: 'Usuario',
                lastName: '',
                profilePicUrl: null,
                email: null,
                isApprovedSeller: false,
            });
        });

        it('should handle repository errors and return default values', async () => {
            UserRepository.findById.mockRejectedValue(new Error('DB Error'));

            const result = await UserService.getUserBasicInfo(mockUserId);

            expect(result).toEqual({
                id: mockUserId,
                name: 'Usuario',
                lastName: '',
                profilePicUrl: null,
                email: null,
                isApprovedSeller: false,
            });
            expect(log.error).toHaveBeenCalledWith('Error getting user basic info', {
                userId: mockUserId,
                error: 'DB Error',
            });
        });

        it('should handle user with id property instead of _id', async () => {
            const mockUser = {
                id: mockUserId,
                name: 'Test',
                lastName: 'User',
                profilePicUrl: 'http://example.com/pic.jpg',
                email: 'test@example.com',
                isApprovedSeller: false,
            };
            UserRepository.findById.mockResolvedValue(mockUser);

            const result = await UserService.getUserBasicInfo(mockUserId);

            expect(result.id).toBe(mockUserId);
        });
    });

    describe('updateUser', () => {
        const validUpdateData = {
            name: 'Updated Name',
            lastName: 'Updated Last',
            phoneNumber: '+1987654321',
            address: 'New Address 123',
        };

        it('should successfully update user with valid fields', async () => {
            UserRepository.updateById.mockResolvedValue(mockUpdatedUser);

            const result = await UserService.updateUserById(mockUserId, validUpdateData);

            expect(result).toEqual(mockUpdatedUser);
            expect(UserRepository.updateById).toHaveBeenCalledWith(mockUserId, validUpdateData);
            expect(log.info).toHaveBeenCalledWith('User updated successfully', {
                userId: mockUserId,
                fields: Object.keys(validUpdateData),
            });
        });

        it('should throw BadRequestException for invalid ID', async () => {
            await expect(UserService.updateUserById('  ', validUpdateData)).rejects.toThrow(
                badRequestException('A valid user ID must be provided for update.'),
            );
        });

        it('should throw BadRequestException for no valid update fields', async () => {
            await expect(
                UserService.updateUserById(mockUserId, { invalidField: 'value' }),
            ).rejects.toThrow(
                badRequestException(
                    'No valid fields provided for update. Allowed fields are: name, lastName, phoneNumber, address, profilePicUrl, isApprovedSeller.',
                ),
            );
        });

        it('should throw NotFoundException when user not found', async () => {
            UserRepository.updateById.mockResolvedValue(null);

            await expect(UserService.updateUserById(mockUserId, validUpdateData)).rejects.toThrow(
                notFoundException(`User with ID '${mockUserId}' not found for update.`),
            );
            expect(log.warn).toHaveBeenCalledWith('User not found for update', {
                userId: mockUserId,
            });
        });

        it('should throw BadRequestException for validation errors', async () => {
            const validationError = new Error('Validation failed');
            validationError.name = 'ValidationError';
            validationError.errors = {
                name: {
                    message: 'Name cannot be empty',
                    path: 'name',
                    value: '',
                },
            };
            UserRepository.updateById.mockRejectedValue(validationError);

            await expect(UserService.updateUserById(mockUserId, { name: '' })).rejects.toThrow(
                badRequestException('Validation failed during update: Name cannot be empty'),
            );
            expect(log.error).toHaveBeenCalledWith('User validation failed during update', {
                userId: mockUserId,
                error: 'Name cannot be empty',
            });
        });

        it('should throw InternalServerError for unexpected errors', async () => {
            UserRepository.updateById.mockRejectedValue(new Error('DB Error'));

            await expect(UserService.updateUserById(mockUserId, validUpdateData)).rejects.toThrow(
                internalServerError(`Failed to update user '${mockUserId}'.`),
            );
            expect(log.error).toHaveBeenCalledWith('Failed to update user', {
                userId: mockUserId,
                error: 'DB Error',
            });
        });
    });

    describe('deleteUser', () => {
        it('should successfully delete an existing user', async () => {
            UserRepository.deleteById.mockResolvedValue(mockCreatedUser);

            const result = await UserService.deleteUserById(mockUserId);

            expect(result).toBe(true);
            expect(UserRepository.deleteById).toHaveBeenCalledWith(mockUserId);
            expect(log.info).toHaveBeenCalledWith('User deleted successfully', {
                userId: mockUserId,
            });
        });

        it('should throw BadRequestException for invalid ID', async () => {
            await expect(UserService.deleteUserById('  ')).rejects.toThrow(
                badRequestException('A valid user ID must be provided for deletion.'),
            );
        });

        it('should throw NotFoundException when user not found', async () => {
            UserRepository.deleteById.mockResolvedValue(null);

            await expect(UserService.deleteUserById(mockUserId)).rejects.toThrow(
                notFoundException(`User with ID '${mockUserId}' not found for deletion.`),
            );
            expect(log.warn).toHaveBeenCalledWith('User not found for deletion', {
                userId: mockUserId,
            });
        });

        it('should throw InternalServerError for repository errors', async () => {
            UserRepository.deleteById.mockRejectedValue(new Error('DB Error'));

            await expect(UserService.deleteUserById(mockUserId)).rejects.toThrow(
                internalServerError(`Failed to delete user '${mockUserId}'.`),
            );
            expect(log.error).toHaveBeenCalledWith('Failed to delete user', {
                userId: mockUserId,
                error: 'DB Error',
            });
        });
    });

    describe('getCurrentUserProfile', () => {
        it('should return complete profile with all fields and email', async () => {
            UserRepository.findById.mockResolvedValue(mockUserData);
            supabase.auth.getUser.mockResolvedValue({
                data: { user: mockSupabaseUser },
                error: null,
            });

            const result = await UserService.getCurrentUserProfile(mockUserId, mockToken);

            expect(result).toEqual(expectedProfileResponse);
            expect(UserRepository.findById).toHaveBeenCalledWith(mockUserId);
            expect(supabase.auth.getUser).toHaveBeenCalledWith(mockToken);
            expect(log.debug).toHaveBeenCalledWith('User profile retrieved successfully', {
                userId: mockUserId,
            });
        });

        it('should handle null optional fields', async () => {
            const userWithNullFields = {
                ...mockUserData,
                lastName: null,
                phoneNumber: null,
                address: null,
            };
            UserRepository.findById.mockResolvedValue(userWithNullFields);
            supabase.auth.getUser.mockResolvedValue({
                data: { user: mockSupabaseUser },
                error: null,
            });

            const result = await UserService.getCurrentUserProfile(mockUserId, mockToken);

            expect(result).toEqual({
                ...expectedProfileResponse,
                lastName: null,
                phoneNumber: null,
                address: null,
            });
        });

        it('should throw BadRequestException for invalid user ID', async () => {
            await expect(UserService.getCurrentUserProfile('  ', mockToken)).rejects.toThrow(
                badRequestException('User ID is required'),
            );

            expect(UserRepository.findById).not.toHaveBeenCalled();
            expect(supabase.auth.getUser).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException when user not found in MongoDB', async () => {
            UserRepository.findById.mockResolvedValue(null);

            await expect(UserService.getCurrentUserProfile(mockUserId, mockToken)).rejects.toThrow(
                notFoundException('User not found'),
            );

            expect(UserRepository.findById).toHaveBeenCalledWith(mockUserId);
            expect(supabase.auth.getUser).not.toHaveBeenCalled();
            expect(log.warn).toHaveBeenCalledWith('User profile not found', {
                userId: mockUserId,
            });
        });

        it('should throw InternalServerError when MongoDB fails', async () => {
            UserRepository.findById.mockRejectedValue(new Error('DB Error'));

            await expect(UserService.getCurrentUserProfile(mockUserId, mockToken)).rejects.toThrow(
                internalServerError('Failed to fetch user profile'),
            );
            expect(log.error).toHaveBeenCalledWith('Failed to fetch user profile', {
                userId: mockUserId,
                error: 'DB Error',
            });
        });

        it('should throw InternalServerError when Supabase fails', async () => {
            UserRepository.findById.mockResolvedValue(mockUserData);
            supabase.auth.getUser.mockResolvedValue({
                data: null,
                error: new Error('Supabase error'),
            });

            await expect(UserService.getCurrentUserProfile(mockUserId, mockToken)).rejects.toThrow(
                internalServerError('Failed to fetch user profile'),
            );
        });

        it('should throw InternalServerError when Supabase fails with error message', async () => {
            UserRepository.findById.mockResolvedValue(mockUserData);

            supabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: { message: 'Supabase failure' },
            });

            await expect(UserService.getCurrentUserProfile(mockUserId, mockToken)).rejects.toThrow(
                internalServerError('Failed to fetch user from Supabase: Supabase failure'),
            );
            expect(log.error).toHaveBeenCalledWith('Failed to fetch user from Supabase', {
                userId: mockUserId,
                error: 'Supabase failure',
            });
        });
    });
});
