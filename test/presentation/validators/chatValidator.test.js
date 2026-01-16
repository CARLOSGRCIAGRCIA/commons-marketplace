import { validationResult } from 'express-validator';
import {
    validateSendMessage,
    validateGetConversationMessages,
    validateMarkMessagesAsRead,
    validateGetConversationByParticipant,
    validateGetUserConversations,
} from '../../../src/presentation/validators/chatValidator.js';

describe('Message Validators', () => {
    let req;
    let res; // eslint-disable-line no-unused-vars
    let next; // eslint-disable-line no-unused-vars

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            query: {},
        };
        res = {};
        next = jest.fn();
    });

    const runValidation = async (validations) => {
        for (const validation of validations) {
            await validation.run(req);
        }
        return validationResult(req);
    };

    describe('validateSendMessage', () => {
        it('should pass validation with valid data', async () => {
            req.body = {
                receiverId: 'user_123',
                content: 'Hello World',
                type: 'text',
                metadata: { timestamp: Date.now() },
            };

            const result = await runValidation(validateSendMessage);

            expect(result.isEmpty()).toBe(true);
        });

        it('should pass validation with minimal required fields', async () => {
            req.body = {
                receiverId: 'user_123',
                content: 'Hi',
            };

            const result = await runValidation(validateSendMessage);

            expect(result.isEmpty()).toBe(true);
        });

        it('should fail when receiverId is missing', async () => {
            req.body = {
                content: 'Hello',
            };

            const result = await runValidation(validateSendMessage);

            expect(result.isEmpty()).toBe(false);
            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: 'Receiver ID is required',
                        path: 'receiverId',
                    }),
                ]),
            );
        });

        it('should fail when receiverId is not a string', async () => {
            req.body = {
                receiverId: 123,
                content: 'Hello',
            };

            const result = await runValidation(validateSendMessage);

            expect(result.isEmpty()).toBe(false);
            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: 'Receiver ID must be a string',
                        path: 'receiverId',
                    }),
                ]),
            );
        });

        it('should fail when content is missing', async () => {
            req.body = {
                receiverId: 'user_123',
            };

            const result = await runValidation(validateSendMessage);

            expect(result.isEmpty()).toBe(false);
            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: 'Content is required',
                        path: 'content',
                    }),
                ]),
            );
        });

        it('should fail when content is empty string', async () => {
            req.body = {
                receiverId: 'user_123',
                content: '   ',
            };

            const result = await runValidation(validateSendMessage);

            expect(result.isEmpty()).toBe(false);
            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: 'Content must be between 1 and 5000 characters',
                        path: 'content',
                    }),
                ]),
            );
        });

        it('should fail when content exceeds 5000 characters', async () => {
            req.body = {
                receiverId: 'user_123',
                content: 'a'.repeat(5001),
            };

            const result = await runValidation(validateSendMessage);

            expect(result.isEmpty()).toBe(false);
            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: 'Content must be between 1 and 5000 characters',
                        path: 'content',
                    }),
                ]),
            );
        });

        it('should fail when type is invalid', async () => {
            req.body = {
                receiverId: 'user_123',
                content: 'Hello',
                type: 'video',
            };

            const result = await runValidation(validateSendMessage);

            expect(result.isEmpty()).toBe(false);
            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: 'Type must be text, image, or file',
                        path: 'type',
                    }),
                ]),
            );
        });

        it('should pass with valid type values', async () => {
            const types = ['text', 'image', 'file'];

            for (const type of types) {
                req.body = {
                    receiverId: 'user_123',
                    content: 'Hello',
                    type,
                };

                const result = await runValidation(validateSendMessage);
                expect(result.isEmpty()).toBe(true);
            }
        });

        it('should fail when metadata is not an object', async () => {
            req.body = {
                receiverId: 'user_123',
                content: 'Hello',
                metadata: 'invalid',
            };

            const result = await runValidation(validateSendMessage);

            expect(result.isEmpty()).toBe(false);
            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: 'Metadata must be an object',
                        path: 'metadata',
                    }),
                ]),
            );
        });
    });

    describe('validateGetConversationMessages', () => {
        it('should pass validation with valid conversationId', async () => {
            req.params = {
                conversationId: '507f1f77bcf86cd799439011',
            };

            const result = await runValidation(validateGetConversationMessages);

            expect(result.isEmpty()).toBe(true);
        });

        it('should pass validation with valid conversationId and query params', async () => {
            req.params = {
                conversationId: '507f1f77bcf86cd799439011',
            };
            req.query = {
                limit: '50',
                skip: '10',
            };

            const result = await runValidation(validateGetConversationMessages);

            expect(result.isEmpty()).toBe(true);
        });

        it('should fail when conversationId is missing', async () => {
            req.params = {};

            const result = await runValidation(validateGetConversationMessages);

            expect(result.isEmpty()).toBe(false);
            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: 'Conversation ID is required',
                        path: 'conversationId',
                    }),
                ]),
            );
        });

        it('should fail when conversationId is not a valid MongoId', async () => {
            req.params = {
                conversationId: 'invalid-id',
            };

            const result = await runValidation(validateGetConversationMessages);

            expect(result.isEmpty()).toBe(false);
            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: 'Invalid conversation ID format',
                        path: 'conversationId',
                    }),
                ]),
            );
        });

        it('should fail when limit is less than 1', async () => {
            req.params = {
                conversationId: '507f1f77bcf86cd799439011',
            };
            req.query = {
                limit: '0',
            };

            const result = await runValidation(validateGetConversationMessages);

            expect(result.isEmpty()).toBe(false);
            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: 'Limit must be between 1 and 100',
                        path: 'limit',
                    }),
                ]),
            );
        });

        it('should fail when limit exceeds 100', async () => {
            req.params = {
                conversationId: '507f1f77bcf86cd799439011',
            };
            req.query = {
                limit: '101',
            };

            const result = await runValidation(validateGetConversationMessages);

            expect(result.isEmpty()).toBe(false);
            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: 'Limit must be between 1 and 100',
                        path: 'limit',
                    }),
                ]),
            );
        });

        it('should fail when skip is negative', async () => {
            req.params = {
                conversationId: '507f1f77bcf86cd799439011',
            };
            req.query = {
                skip: '-1',
            };

            const result = await runValidation(validateGetConversationMessages);

            expect(result.isEmpty()).toBe(false);
            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: 'Skip must be a positive number',
                        path: 'skip',
                    }),
                ]),
            );
        });
    });

    describe('validateMarkMessagesAsRead', () => {
        it('should pass validation with valid conversationId', async () => {
            req.params = {
                conversationId: '507f1f77bcf86cd799439011',
            };

            const result = await runValidation(validateMarkMessagesAsRead);

            expect(result.isEmpty()).toBe(true);
        });

        it('should fail when conversationId is missing', async () => {
            req.params = {};

            const result = await runValidation(validateMarkMessagesAsRead);

            expect(result.isEmpty()).toBe(false);
            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: 'Conversation ID is required',
                        path: 'conversationId',
                    }),
                ]),
            );
        });

        it('should fail when conversationId is not a valid MongoId', async () => {
            req.params = {
                conversationId: 'invalid-id',
            };

            const result = await runValidation(validateMarkMessagesAsRead);

            expect(result.isEmpty()).toBe(false);
            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: 'Invalid conversation ID format',
                        path: 'conversationId',
                    }),
                ]),
            );
        });
    });

    describe('validateGetConversationByParticipant', () => {
        it('should pass validation with valid participantId', async () => {
            req.params = {
                participantId: 'user_123',
            };

            const result = await runValidation(validateGetConversationByParticipant);

            expect(result.isEmpty()).toBe(true);
        });

        it('should fail when participantId is missing', async () => {
            req.params = {};

            const result = await runValidation(validateGetConversationByParticipant);

            expect(result.isEmpty()).toBe(false);
            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: 'Participant ID is required',
                        path: 'participantId',
                    }),
                ]),
            );
        });

        it('should fail when participantId is not a string', async () => {
            req.params = {
                participantId: 123,
            };

            const result = await runValidation(validateGetConversationByParticipant);

            expect(result.isEmpty()).toBe(false);
            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: 'Participant ID must be a string',
                        path: 'participantId',
                    }),
                ]),
            );
        });
    });

    describe('validateGetUserConversations', () => {
        it('should pass validation without query params', async () => {
            req.query = {};

            const result = await runValidation(validateGetUserConversations);

            expect(result.isEmpty()).toBe(true);
        });

        it('should pass validation with valid query params', async () => {
            req.query = {
                limit: '25',
                skip: '5',
            };

            const result = await runValidation(validateGetUserConversations);

            expect(result.isEmpty()).toBe(true);
        });

        it('should fail when limit is less than 1', async () => {
            req.query = {
                limit: '0',
            };

            const result = await runValidation(validateGetUserConversations);

            expect(result.isEmpty()).toBe(false);
            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: 'Limit must be between 1 and 100',
                        path: 'limit',
                    }),
                ]),
            );
        });

        it('should fail when limit exceeds 100', async () => {
            req.query = {
                limit: '101',
            };

            const result = await runValidation(validateGetUserConversations);

            expect(result.isEmpty()).toBe(false);
            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: 'Limit must be between 1 and 100',
                        path: 'limit',
                    }),
                ]),
            );
        });

        it('should fail when skip is negative', async () => {
            req.query = {
                skip: '-1',
            };

            const result = await runValidation(validateGetUserConversations);

            expect(result.isEmpty()).toBe(false);
            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: 'Skip must be a positive number',
                        path: 'skip',
                    }),
                ]),
            );
        });

        it('should pass with limit at boundary values', async () => {
            req.query = { limit: '1' };
            let result = await runValidation(validateGetUserConversations);
            expect(result.isEmpty()).toBe(true);

            req.query = { limit: '100' };
            result = await runValidation(validateGetUserConversations);
            expect(result.isEmpty()).toBe(true);
        });

        it('should pass with skip at boundary value', async () => {
            req.query = { skip: '0' };
            const result = await runValidation(validateGetUserConversations);
            expect(result.isEmpty()).toBe(true);
        });
    });
});
