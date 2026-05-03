import { param } from 'express-validator';

export const productIdParamValidation = () => [
    param('id')
        .trim()
        .notEmpty()
        .withMessage('Product ID is required')
        .isString()
        .withMessage('Product ID must be a string'),
];
