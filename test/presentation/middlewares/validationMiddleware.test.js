import { validate } from '../../../src/presentation/middlewares/validationMiddleware.js';
import { validationResult } from 'express-validator';

jest.mock('express-validator');

describe('Validation Middleware', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    it('should call next if there are no validation errors', () => {
        validationResult.mockReturnValue({ isEmpty: () => true });
        validate(req, res, next);
        expect(next).toHaveBeenCalledWith();
    });

    it('should return a 422 error if there are validation errors', () => {
        const errors = [
            { param: 'email', msg: 'Invalid email', path: 'email' },
            { param: 'password', msg: 'Password too short', path: 'password' },
        ];
        validationResult.mockReturnValue({ isEmpty: () => false, array: () => errors });

        validate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Validation failed. Submitted data is invalid.',
            errors: errors.map((err) => ({
                field: err.param,
                message: err.msg,
                value: err.path,
            })),
        });
        expect(next).not.toHaveBeenCalled();
    });
});
