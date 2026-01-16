import { badRequestException } from '../../../src/presentation/exceptions/badRequestException.js';
import { duplicateKeyException } from '../../../src/presentation/exceptions/duplicateKeyException.js';
import { forbiddenException } from '../../../src/presentation/exceptions/forbiddenException.js';
import { internalServerError } from '../../../src/presentation/exceptions/internalServerError.js';
import { notFoundException } from '../../../src/presentation/exceptions/notFoundException.js';
import { unauthorizedException } from '../../../src/presentation/exceptions/unauthorizedException.js';

describe('Exceptions', () => {
    describe('badRequestException', () => {
        it('should create a bad request exception with default message and status code 400', () => {
            const err = badRequestException();
            expect(err.name).toBe('BadRequestException');
            expect(err.message).toBe('Bad Request');
            expect(err.statusCode).toBe(400);
        });

        it('should create a bad request exception with a custom message', () => {
            const message = 'Custom bad request message';
            const err = badRequestException(message);
            expect(err.message).toBe(message);
        });
    });

    describe('duplicateKeyException', () => {
        it('should create a duplicate key exception with default message and status 409', () => {
            const err = duplicateKeyException();
            expect(err.name).toBe('DuplicateKeyException');
            expect(err.message).toBe('Duplicated key error');
            expect(err.status).toBe(409);
        });

        it('should create a duplicate key exception with a custom message', () => {
            const message = 'Custom duplicate key message';
            const err = duplicateKeyException(message);
            expect(err.message).toBe(message);
        });
    });

    describe('forbiddenException', () => {
        it('should create a forbidden exception with default message and status code 403', () => {
            const err = forbiddenException();
            expect(err.name).toBe('ForbiddenException');
            expect(err.message).toBe('Forbidden');
            expect(err.statusCode).toBe(403);
        });

        it('should create a forbidden exception with a custom message', () => {
            const message = 'Custom forbidden message';
            const err = forbiddenException(message);
            expect(err.message).toBe(message);
        });
    });

    describe('internalServerError', () => {
        it('should create an internal server error with default message and status code 500', () => {
            const err = internalServerError();
            expect(err.name).toBe('InternalServerError');
            expect(err.message).toBe('Internal Server Error');
            expect(err.statusCode).toBe(500);
        });

        it('should create an internal server error with a custom message', () => {
            const message = 'Custom internal server error message';
            const err = internalServerError(message);
            expect(err.message).toBe(message);
        });
    });

    describe('notFoundException', () => {
        it('should create a not found exception with default message and status code 404', () => {
            const err = notFoundException();
            expect(err.name).toBe('NotFoundException');
            expect(err.message).toBe('Not Found');
            expect(err.statusCode).toBe(404);
        });

        it('should create a not found exception with a custom message', () => {
            const message = 'Custom not found message';
            const err = notFoundException(message);
            expect(err.message).toBe(message);
        });
    });

    describe('unauthorizedException', () => {
        it('should create an unauthorized exception with default message and status code 401', () => {
            const err = unauthorizedException();
            expect(err.name).toBe('UnauthorizedException');
            expect(err.message).toBe('Unauthorized');
            expect(err.statusCode).toBe(401);
        });

        it('should create an unauthorized exception with a custom message', () => {
            const message = 'Custom unauthorized message';
            const err = unauthorizedException(message);
            expect(err.message).toBe(message);
        });
    });
});
