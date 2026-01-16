import { body, param } from 'express-validator';

export const createUserValidation = () => [
    body('_id')
        .trim()
        .notEmpty()
        .withMessage('User ID (_id) is required.')
        .isString()
        .withMessage('User ID (_id) must be a string.'),
    body('name')
        .optional({ nullable: true })
        .trim()
        .isString()
        .withMessage('Name must be a string.'),
    body('lastName')
        .optional({ nullable: true })
        .trim()
        .isString()
        .withMessage('Last name must be a string.'),
    body('phoneNumber')
        .optional({ nullable: true })
        .trim()
        .isString()
        .withMessage('Phone number must be a string.'),
    body('address')
        .optional({ nullable: true })
        .trim()
        .isString()
        .withMessage('Address must be a string.'),
    body('profilePicUrl')
        .optional({ nullable: true })
        .trim()
        .isURL()
        .withMessage('Profile picture URL must be a valid URL format.')
        .isString()
        .withMessage('Profile picture URL must be a string.'),
    body('isApprovedSeller')
        .optional()
        .isBoolean()
        .withMessage('isApprovedSeller must be a boolean (true or false).'),
];

export const updateUserValidation = () => [
    body('name')
        .optional({ nullable: true })
        .trim()
        .isString()
        .withMessage('Name must be a string.'),
    body('lastName')
        .optional({ nullable: true })
        .trim()
        .isString()
        .withMessage('Last name must be a string.'),
    body('phoneNumber')
        .optional({ nullable: true })
        .trim()
        .isString()
        .withMessage('Phone number must be a string.'),
    body('address')
        .optional({ nullable: true })
        .trim()
        .isString()
        .withMessage('Address must be a string.'),
    body('profilePicUrl')
        .optional({ nullable: true })
        .trim()
        .isURL()
        .withMessage('Profile picture URL must be a valid URL format.')
        .isString()
        .withMessage('Profile picture URL must be a string.'),
    body('isApprovedSeller')
        .optional()
        .isBoolean()
        .withMessage('isApprovedSeller must be a boolean (true or false).'),
];

export const userIdParamValidation = () => [
    param('id')
        .trim()
        .notEmpty()
        .withMessage('User ID parameter cannot be empty.')
        .isString()
        .withMessage('User ID parameter must be a string.'),
];
