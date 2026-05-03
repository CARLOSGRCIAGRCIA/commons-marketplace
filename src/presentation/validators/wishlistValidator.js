import { body, param } from 'express-validator';

export const addToWishlistValidation = () => [
    body('productId')
        .trim()
        .notEmpty()
        .withMessage('Product ID is required')
        .isString()
        .withMessage('Product ID must be a string'),
];

export const productIdParamValidation = () => [
    param('productId')
        .trim()
        .notEmpty()
        .withMessage('Product ID is required')
        .isString()
        .withMessage('Product ID must be a string'),
];
