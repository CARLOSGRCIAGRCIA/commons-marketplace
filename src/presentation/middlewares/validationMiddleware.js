import { validationResult } from 'express-validator';

/**
 * Express middleware that validates incoming request data using `express-validator`.
 *
 * This middleware checks for validation errors accumulated from previous
 * validation chains. If no errors exist, it proceeds to the next middleware.
 * Otherwise, it returns a 422 Unprocessable Entity response with detailed
 * information about each validation error.
 * @function validate
 * @param {import('express').Request} req - Express request object containing validation results.
 * @param {import('express').Response} res - Express response object used to send error responses.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {void} Does not return a value; either calls `next()` or sends a response.
 * @example
 * import { body } from 'express-validator';
 * import { validate } from '../middleware/validate.js';
 *
 * app.post(
 *   '/register',
 *   [
 *     body('email').isEmail().withMessage('Invalid email address'),
 *     body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
 *   ],
 *   validate,
 *   (req, res) => {
 *     res.status(200).json({ message: 'User registered successfully' });
 *   }
 * );
 */

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }

    const extractedErrors = errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
        value: err.path,
    }));

    return res.status(422).json({
        message: 'Validation failed. Submitted data is invalid.',
        errors: extractedErrors,
    });
};
