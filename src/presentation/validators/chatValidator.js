import { body, param, query } from 'express-validator';

/**
 * Validate send message request
 * @description Validation rules for sending a message
 */
export const validateSendMessage = [
    body('receiverId')
        .notEmpty()
        .withMessage('Receiver ID is required')
        .isString()
        .withMessage('Receiver ID must be a string'),
    body('content')
        .notEmpty()
        .withMessage('Content is required')
        .isString()
        .withMessage('Content must be a string')
        .trim()
        .isLength({ min: 1, max: 5000 })
        .withMessage('Content must be between 1 and 5000 characters'),
    body('type')
        .optional()
        .isIn(['text', 'image', 'file'])
        .withMessage('Type must be text, image, or file'),
    body('metadata').optional().isObject().withMessage('Metadata must be an object'),
];

/**
 * Validate get conversation messages request
 * @description Validation rules for getting conversation messages
 */
export const validateGetConversationMessages = [
    param('conversationId')
        .notEmpty()
        .withMessage('Conversation ID is required')
        .isMongoId()
        .withMessage('Invalid conversation ID format'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('skip').optional().isInt({ min: 0 }).withMessage('Skip must be a positive number'),
];

/**
 * Validate mark messages as read request
 * @description Validation rules for marking messages as read
 */
export const validateMarkMessagesAsRead = [
    param('conversationId')
        .notEmpty()
        .withMessage('Conversation ID is required')
        .isMongoId()
        .withMessage('Invalid conversation ID format'),
];

/**
 * Validate get conversation by participant request
 * @description Validation rules for getting conversation by participant
 */
export const validateGetConversationByParticipant = [
    param('participantId')
        .notEmpty()
        .withMessage('Participant ID is required')
        .isString()
        .withMessage('Participant ID must be a string'),
];

/**
 * Validate get user conversations request
 * @description Validation rules for getting user conversations
 */
export const validateGetUserConversations = [
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('skip').optional().isInt({ min: 0 }).withMessage('Skip must be a positive number'),
];
