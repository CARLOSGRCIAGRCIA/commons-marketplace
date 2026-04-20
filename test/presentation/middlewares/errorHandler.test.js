import { errorHandler } from '../../../src/presentation/middlewares/errorHandler.js';

jest.mock('../../../src/infrastructure/logger/logger.js', () => ({
    log: {
        info: jest.fn(),
        debug: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
    },
}));

describe('ErrorHandler Middleware', () => {
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        mockReq = {
            path: '/api/test',
            method: 'GET',
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
        process.env.NODE_ENV = 'test';
    });

    it('should handle error with statusCode 500', () => {
        const error = new Error('Server error');
        error.statusCode = 500;

        errorHandler(error, mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: 'Server error',
            status: 500,
        });
    });

    it('should handle error with status 400', () => {
        const error = new Error('Client error');
        error.status = 400;

        errorHandler(error, mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should include stack in development mode', () => {
        process.env.NODE_ENV = 'development';
        const error = new Error('Test error');
        error.statusCode = 500;

        errorHandler(error, mockReq, mockRes, mockNext);

        expect(mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining({
                stack: expect.any(String),
            })
        );
    });

    it('should log server error for 5xx', () => {
        const error = new Error('Server error');
        error.statusCode = 500;

        errorHandler(error, mockReq, mockRes, mockNext);

        const { log } = require('../../../src/infrastructure/logger/logger.js');
        expect(log.error).toHaveBeenCalled();
    });

    it('should log client error for 4xx', () => {
        const error = new Error('Client error');
        error.statusCode = 400;

        errorHandler(error, mockReq, mockRes, mockNext);

        const { log } = require('../../../src/infrastructure/logger/logger.js');
        expect(log.warn).toHaveBeenCalled();
    });

    it('should log info for other errors', () => {
        const error = new Error('Info');
        error.statusCode = 300;

        errorHandler(error, mockReq, mockRes, mockNext);

        const { log } = require('../../../src/infrastructure/logger/logger.js');
        expect(log.info).toHaveBeenCalled();
    });

    it('should use default status 500 if none provided', () => {
        const error = new Error('Error');

        errorHandler(error, mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    it('should use default message if not provided', () => {
        const error = {};
        error.statusCode = 500;

        errorHandler(error, mockReq, mockRes, mockNext);

        expect(mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining({
                error: 'Internal server error',
            })
        );
    });
});