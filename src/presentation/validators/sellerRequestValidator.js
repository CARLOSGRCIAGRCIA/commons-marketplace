import { body, param, query } from 'express-validator';

/**
 * Validation rules for creating a seller request
 * @returns {Array} Validation chain
 */
export const createSellerRequestValidation = () => [
    body('message')
        .optional()
        .isString()
        .withMessage('Message must be a string')
        .trim()
        .isLength({ max: 500 })
        .withMessage('Message cannot exceed 500 characters'),
];

/**
 * Validation rules for seller request ID parameter
 * @returns {Array} Validation chain
 */
export const sellerRequestIdParamValidation = () => [
    param('id')
        .trim()
        .notEmpty()
        .withMessage('Request ID is required')
        .isMongoId()
        .withMessage('Request ID must be a valid MongoDB ID'),
];

/**
 * Validation rules for updating seller request status
 * @returns {Array} Validation chain
 */
export const updateSellerRequestStatusValidation = () => [
    body('status')
        .trim()
        .notEmpty()
        .withMessage('Status is required')
        .isIn(['approved', 'rejected'])
        .withMessage('Status must be either "approved" or "rejected"'),
    body('adminComment')
        .optional()
        .isString()
        .withMessage('Admin comment must be a string')
        .trim()
        .isLength({ max: 500 })
        .withMessage('Admin comment cannot exceed 500 characters'),
];

/**
 * Validation rules for filtering seller requests
 * @returns {Array} Validation chain
 */
export const filterSellerRequestsValidation = () => [
    query('status')
        .optional()
        .isIn(['pending', 'approved', 'rejected'])
        .withMessage('Status must be one of: pending, approved, rejected'),
];
