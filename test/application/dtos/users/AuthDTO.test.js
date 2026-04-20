const { AuthDTO } = require('../../../../src/application/dtos/users/AuthDTO.js');

describe('AuthDTO', () => {
    describe('registerRequest', () => {
        it('should create register request with email and password', () => {
            const result = AuthDTO.registerRequest({
                email: 'test@example.com',
                password: 'password123',
            });
            expect(result.email).toBe('test@example.com');
            expect(result.password).toBe('password123');
        });

        it('should default role to buyer', () => {
            const result = AuthDTO.registerRequest({
                email: 'test@example.com',
                password: 'password123',
            });
            expect(result.role).toBe('buyer');
        });

        it('should use custom role when provided', () => {
            const result = AuthDTO.registerRequest({
                email: 'test@example.com',
                password: 'password123',
                role: 'seller',
            });
            expect(result.role).toBe('seller');
        });

        it('should handle admin role', () => {
            const result = AuthDTO.registerRequest({
                email: 'test@example.com',
                password: 'password123',
                role: 'admin',
            });
            expect(result.role).toBe('admin');
        });
    });

    describe('registerResponse', () => {
        it('should create response with user and default message', () => {
            const user = { _id: 'user123', name: 'John' };
            const result = AuthDTO.registerResponse(user);
            expect(result.message).toBe('User registered successfully');
            expect(result.user).toEqual(user);
        });

        it('should use custom message when provided', () => {
            const user = { _id: 'user123' };
            const result = AuthDTO.registerResponse(user, 'Custom message');
            expect(result.message).toBe('Custom message');
        });
    });

    describe('loginRequest', () => {
        it('should create login request with email and password', () => {
            const result = AuthDTO.loginRequest({
                email: 'test@example.com',
                password: 'password123',
            });
            expect(result.email).toBe('test@example.com');
            expect(result.password).toBe('password123');
        });
    });

    describe('loginResponse', () => {
        it('should create response with token and default message', () => {
            const result = AuthDTO.loginResponse('token123');
            expect(result.message).toBe('Login successful');
            expect(result.token).toBe('token123');
        });

        it('should use custom message when provided', () => {
            const result = AuthDTO.loginResponse('token123', 'Welcome back!');
            expect(result.message).toBe('Welcome back!');
        });
    });

    describe('logoutResponse', () => {
        it('should create response with default message', () => {
            const result = AuthDTO.logoutResponse();
            expect(result.message).toBe('Logged out successfully');
        });

        it('should use custom message when provided', () => {
            const result = AuthDTO.logoutResponse('Session ended');
            expect(result.message).toBe('Session ended');
        });
    });
});