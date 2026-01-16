import supabase from '../../../src/infrastructure/supabase/config/supabaseClient.js';
import * as AuthService from '../../../src/core/services/AuthService.js';
import * as UserService from '../../../src/core/services/userService.js';
import { unauthorizedException } from '../../../src/presentation/exceptions/unauthorizedException.js';
import { badRequestException } from '../../../src/presentation/exceptions/badRequestException.js';
import { internalServerError } from '../../../src/presentation/exceptions/internalServerError.js';

jest.mock('../../../src/infrastructure/supabase/config/supabaseClient.js', () => ({
    auth: {
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
        signOut: jest.fn(),
    },
}));

jest.mock('../../../src/core/services/userService.js', () => ({
    createUser: jest.fn(),
}));

describe('AuthService Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Register User Tests', () => {
        it('should register a new user and return user object', async () => {
            const mockUserId = '12345';
            const mockNewUser = { _id: mockUserId, name: null, isApprovedSeller: false };

            supabase.auth.signUp.mockResolvedValue({
                data: { user: { id: mockUserId } },
                error: null,
            });

            UserService.createUser.mockResolvedValue(mockNewUser);

            const result = await AuthService.register('test@example.com', 'password123');
            expect(result).toEqual({
                message: 'User registered successfully',
                user: mockNewUser,
            });
        });

        it('should throw badRequestException on Supabase error', async () => {
            supabase.auth.signUp.mockResolvedValue({
                data: null,
                error: { message: 'Invalid email' },
            });

            await expect(AuthService.register('bad@example.com', '123')).rejects.toThrow(
                badRequestException('Invalid email'),
            );
        });

        it('should throw internalServerError if MongoDB user creation fails', async () => {
            supabase.auth.signUp.mockResolvedValue({
                data: { user: { id: 'abc123' } },
                error: null,
            });

            UserService.createUser.mockRejectedValue(new Error('MongoDB down'));

            await expect(AuthService.register('test@example.com', '123456')).rejects.toThrow(
                internalServerError('Registration failedError: MongoDB down'),
            );
        });
    });

    describe('Login User Tests', () => {
        it('should return session on successful login', async () => {
            const session = { accessToken: 'abc-token' };

            supabase.auth.signInWithPassword.mockResolvedValue({
                data: { session },
                error: null,
            });

            const result = await AuthService.login('user@mail.com', 'password');
            expect(result).toEqual({
                message: 'Login successful',
                token: session,
            });
        });

        it('should throw unauthorizedException on login error', async () => {
            supabase.auth.signInWithPassword.mockResolvedValue({
                data: null,
                error: { message: 'Invalid credentials' },
            });

            await expect(AuthService.login('bad@mail.com', 'wrong')).rejects.toThrow(
                unauthorizedException('Invalid credentials'),
            );
        });
    });

    describe('Logout User Tests', () => {
        it('should return message on successful logout', async () => {
            supabase.auth.signOut.mockResolvedValue({ error: null });

            const result = await AuthService.logout('mock-token');
            expect(result).toEqual({ message: 'Logged out successfully' });
        });

        it('should throw badRequestException on logout error', async () => {
            supabase.auth.signOut.mockResolvedValue({
                error: { message: 'Invalid token' },
            });

            await expect(AuthService.logout('bad-token')).rejects.toThrow(
                badRequestException('Invalid token'),
            );
        });
    });
});
