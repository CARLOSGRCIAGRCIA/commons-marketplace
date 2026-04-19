import {
    authLimiter,
    apiLimiter,
    uploadLimiter,
    passwordResetLimiter,
    chatLimiter,
} from '../../../src/presentation/middlewares/rateLimiter.js';
import { tooManyRequestsException } from '../../../src/presentation/exceptions/index.js';

describe('Rate Limiter Middleware', () => {
    describe('Exports', () => {
        it('should export authLimiter', () => {
            expect(authLimiter).toBeDefined();
        });

        it('should export apiLimiter', () => {
            expect(apiLimiter).toBeDefined();
        });

        it('should export uploadLimiter', () => {
            expect(uploadLimiter).toBeDefined();
        });

        it('should export passwordResetLimiter', () => {
            expect(passwordResetLimiter).toBeDefined();
        });

        it('should export chatLimiter', () => {
            expect(chatLimiter).toBeDefined();
        });
    });

    describe('Rate Limit Methods', () => {
        it('authLimiter should have getKey method', () => {
            expect(typeof authLimiter.getKey).toBe('function');
        });

        it('apiLimiter should have getKey method', () => {
            expect(typeof apiLimiter.getKey).toBe('function');
        });

        it('authLimiter should have resetKey method', () => {
            expect(typeof authLimiter.resetKey).toBe('function');
        });

        it('apiLimiter should have resetKey method', () => {
            expect(typeof apiLimiter.resetKey).toBe('function');
        });

        it('uploadLimiter should have getKey method', () => {
            expect(typeof uploadLimiter.getKey).toBe('function');
        });

        it('passwordResetLimiter should have getKey method', () => {
            expect(typeof passwordResetLimiter.getKey).toBe('function');
        });

        it('chatLimiter should have getKey method', () => {
            expect(typeof chatLimiter.getKey).toBe('function');
        });
    });

    describe('tooManyRequestsException', () => {
        it('should create exception with statusCode 429', () => {
            const error = tooManyRequestsException('Test message');
            expect(error.statusCode).toBe(429);
            expect(error.message).toBe('Test message');
            expect(error.name).toBe('TooManyRequestsException');
        });
    });
});
