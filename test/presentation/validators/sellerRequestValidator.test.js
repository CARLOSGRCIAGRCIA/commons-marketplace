import { validationResult } from 'express-validator';
import {
    createSellerRequestValidation,
    sellerRequestIdParamValidation,
    updateSellerRequestStatusValidation,
    filterSellerRequestsValidation,
} from '../../../src/presentation/validators/sellerRequestValidator.js';

describe('SellerRequestValidator', () => {
    describe('createSellerRequestValidation', () => {
        it('should pass validation with valid optional message', async () => {
            const req = {
                body: {
                    message: 'This is a valid message',
                },
            };

            for (const validation of createSellerRequestValidation()) {
                await validation.run(req);
            }

            const errors = validationResult(req);

            expect(errors.isEmpty()).toBe(true);
        });

        it('should pass validation without message', async () => {
            const req = {
                body: {},
            };

            for (const validation of createSellerRequestValidation()) {
                await validation.run(req);
            }

            const errors = validationResult(req);

            expect(errors.isEmpty()).toBe(true);
        });

        it('should fail validation when message is not a string', async () => {
            const req = {
                body: {
                    message: 12345,
                },
            };

            for (const validation of createSellerRequestValidation()) {
                await validation.run(req);
            }

            const errors = validationResult(req);

            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()).toHaveLength(1);
            expect(errors.array()[0].msg).toBe('Message must be a string');
        });

        it('should fail validation when message exceeds 500 characters', async () => {
            const req = {
                body: {
                    message: 'a'.repeat(501),
                },
            };

            for (const validation of createSellerRequestValidation()) {
                await validation.run(req);
            }

            const errors = validationResult(req);

            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()).toHaveLength(1);
            expect(errors.array()[0].msg).toBe('Message cannot exceed 500 characters');
        });

        it('should trim message whitespace', async () => {
            const req = {
                body: {
                    message: '  This is a message with spaces  ',
                },
            };

            for (const validation of createSellerRequestValidation()) {
                await validation.run(req);
            }

            const errors = validationResult(req);

            expect(errors.isEmpty()).toBe(true);
        });

        it('should pass validation with message exactly 500 characters', async () => {
            const req = {
                body: {
                    message: 'a'.repeat(500),
                },
            };

            for (const validation of createSellerRequestValidation()) {
                await validation.run(req);
            }

            const errors = validationResult(req);

            expect(errors.isEmpty()).toBe(true);
        });
    });

    describe('sellerRequestIdParamValidation', () => {
        it('should pass validation with valid MongoDB ID', async () => {
            const req = {
                params: {
                    id: '507f1f77bcf86cd799439011',
                },
            };

            for (const validation of sellerRequestIdParamValidation()) {
                await validation.run(req);
            }

            const errors = validationResult(req);

            expect(errors.isEmpty()).toBe(true);
        });

        it('should fail validation when ID is missing', async () => {
            const req = {
                params: {},
            };

            for (const validation of sellerRequestIdParamValidation()) {
                await validation.run(req);
            }

            const errors = validationResult(req);

            expect(errors.isEmpty()).toBe(false);
            const errorMessages = errors.array().map((error) => error.msg);
            expect(errorMessages).toContain('Request ID is required');
        });

        it('should fail validation when ID is empty string', async () => {
            const req = {
                params: {
                    id: '',
                },
            };

            for (const validation of sellerRequestIdParamValidation()) {
                await validation.run(req);
            }

            const errors = validationResult(req);

            expect(errors.isEmpty()).toBe(false);
            const errorMessages = errors.array().map((error) => error.msg);
            expect(errorMessages).toContain('Request ID is required');
        });

        it('should fail validation when ID is not a valid MongoDB ID', async () => {
            const req = {
                params: {
                    id: 'invalid-id',
                },
            };

            for (const validation of sellerRequestIdParamValidation()) {
                await validation.run(req);
            }

            const errors = validationResult(req);

            expect(errors.isEmpty()).toBe(false);
            const errorMessages = errors.array().map((error) => error.msg);
            expect(errorMessages).toContain('Request ID must be a valid MongoDB ID');
        });

        it('should trim ID whitespace', async () => {
            const req = {
                params: {
                    id: '  507f1f77bcf86cd799439011  ',
                },
            };

            for (const validation of sellerRequestIdParamValidation()) {
                await validation.run(req);
            }

            const errors = validationResult(req);

            expect(errors.isEmpty()).toBe(true);
        });

        it('should fail validation with numeric ID', async () => {
            const req = {
                params: {
                    id: 12345,
                },
            };

            for (const validation of sellerRequestIdParamValidation()) {
                await validation.run(req);
            }

            const errors = validationResult(req);

            expect(errors.isEmpty()).toBe(false);
            const errorMessages = errors.array().map((error) => error.msg);
            expect(errorMessages).toContain('Request ID must be a valid MongoDB ID');
        });
    });

    describe('updateSellerRequestStatusValidation', () => {
        it('should pass validation with valid status and optional admin comment', async () => {
            const req = {
                body: {
                    status: 'approved',
                    adminComment: 'This request looks good',
                },
            };

            for (const validation of updateSellerRequestStatusValidation()) {
                await validation.run(req);
            }

            const errors = validationResult(req);

            expect(errors.isEmpty()).toBe(true);
        });

        it('should pass validation with valid status and no admin comment', async () => {
            const req = {
                body: {
                    status: 'rejected',
                },
            };

            for (const validation of updateSellerRequestStatusValidation()) {
                await validation.run(req);
            }

            const errors = validationResult(req);

            expect(errors.isEmpty()).toBe(true);
        });

        it('should fail validation when status is missing', async () => {
            const req = {
                body: {
                    adminComment: 'Some comment',
                },
            };

            for (const validation of updateSellerRequestStatusValidation()) {
                await validation.run(req);
            }

            const errors = validationResult(req);

            expect(errors.isEmpty()).toBe(false);
            const errorMessages = errors.array().map((error) => error.msg);
            expect(errorMessages).toContain('Status is required');
        });

        it('should fail validation when status is empty string', async () => {
            const req = {
                body: {
                    status: '',
                },
            };

            for (const validation of updateSellerRequestStatusValidation()) {
                await validation.run(req);
            }

            const errors = validationResult(req);

            expect(errors.isEmpty()).toBe(false);
            const errorMessages = errors.array().map((error) => error.msg);
            expect(errorMessages).toContain('Status is required');
        });

        it('should fail validation when status is not "approved" or "rejected"', async () => {
            const req = {
                body: {
                    status: 'pending',
                },
            };

            for (const validation of updateSellerRequestStatusValidation()) {
                await validation.run(req);
            }

            const errors = validationResult(req);

            expect(errors.isEmpty()).toBe(false);
            const errorMessages = errors.array().map((error) => error.msg);
            expect(errorMessages).toContain('Status must be either "approved" or "rejected"');
        });

        it('should fail validation when admin comment is not a string', async () => {
            const req = {
                body: {
                    status: 'approved',
                    adminComment: 12345,
                },
            };

            for (const validation of updateSellerRequestStatusValidation()) {
                await validation.run(req);
            }

            const errors = validationResult(req);

            expect(errors.isEmpty()).toBe(false);
            const errorMessages = errors.array().map((error) => error.msg);
            expect(errorMessages).toContain('Admin comment must be a string');
        });

        it('should fail validation when admin comment exceeds 500 characters', async () => {
            const req = {
                body: {
                    status: 'approved',
                    adminComment: 'a'.repeat(501),
                },
            };

            for (const validation of updateSellerRequestStatusValidation()) {
                await validation.run(req);
            }

            const errors = validationResult(req);

            expect(errors.isEmpty()).toBe(false);
            const errorMessages = errors.array().map((error) => error.msg);
            expect(errorMessages).toContain('Admin comment cannot exceed 500 characters');
        });

        it('should trim status and admin comment whitespace', async () => {
            const req = {
                body: {
                    status: '  approved  ',
                    adminComment: '  This is a comment with spaces  ',
                },
            };

            for (const validation of updateSellerRequestStatusValidation()) {
                await validation.run(req);
            }

            const errors = validationResult(req);

            expect(errors.isEmpty()).toBe(true);
        });

        it('should pass validation with admin comment exactly 500 characters', async () => {
            const req = {
                body: {
                    status: 'rejected',
                    adminComment: 'a'.repeat(500),
                },
            };

            for (const validation of updateSellerRequestStatusValidation()) {
                await validation.run(req);
            }

            const errors = validationResult(req);

            expect(errors.isEmpty()).toBe(true);
        });

        it('should fail validation with invalid status values', async () => {
            const invalidStatuses = ['pending', 'completed', 'cancelled', 'in_progress', ''];

            for (const status of invalidStatuses) {
                const req = {
                    body: { status },
                };

                for (const validation of updateSellerRequestStatusValidation()) {
                    await validation.run(req);
                }

                const errors = validationResult(req);

                expect(errors.isEmpty()).toBe(false);
            }
        });
    });

    describe('filterSellerRequestsValidation', () => {
        it('should pass validation with valid status', async () => {
            const req = {
                query: {
                    status: 'pending',
                },
            };

            for (const validation of filterSellerRequestsValidation()) {
                await validation.run(req);
            }

            const errors = validationResult(req);

            expect(errors.isEmpty()).toBe(true);
        });

        it('should pass validation without status', async () => {
            const req = {
                query: {},
            };

            for (const validation of filterSellerRequestsValidation()) {
                await validation.run(req);
            }

            const errors = validationResult(req);

            expect(errors.isEmpty()).toBe(true);
        });

        it('should pass validation with all valid statuses', async () => {
            const validStatuses = ['pending', 'approved', 'rejected'];

            for (const status of validStatuses) {
                const req = {
                    query: { status },
                };

                for (const validation of filterSellerRequestsValidation()) {
                    await validation.run(req);
                }

                const errors = validationResult(req);

                expect(errors.isEmpty()).toBe(true);
            }
        });

        it('should fail validation with invalid status', async () => {
            const req = {
                query: {
                    status: 'invalid-status',
                },
            };

            for (const validation of filterSellerRequestsValidation()) {
                await validation.run(req);
            }

            const errors = validationResult(req);

            expect(errors.isEmpty()).toBe(false);
            const errorMessages = errors.array().map((error) => error.msg);
            expect(errorMessages).toContain('Status must be one of: pending, approved, rejected');
        });

        it('should pass validation with undefined status', async () => {
            const req = {
                query: {
                    status: undefined,
                },
            };

            for (const validation of filterSellerRequestsValidation()) {
                await validation.run(req);
            }

            const errors = validationResult(req);

            expect(errors.isEmpty()).toBe(true);
        });

        it('should handle null status gracefully', async () => {
            const req = {
                query: {
                    status: null,
                },
            };

            for (const validation of filterSellerRequestsValidation()) {
                await validation.run(req);
            }

            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const errorMessages = errors.array().map((error) => error.msg);
                expect(errorMessages).toContain(
                    'Status must be one of: pending, approved, rejected',
                );
            }
        });

        it('should fail validation with numeric status', async () => {
            const req = {
                query: {
                    status: 123,
                },
            };

            for (const validation of filterSellerRequestsValidation()) {
                await validation.run(req);
            }

            const errors = validationResult(req);

            expect(errors.isEmpty()).toBe(false);
            const errorMessages = errors.array().map((error) => error.msg);
            expect(errorMessages).toContain('Status must be one of: pending, approved, rejected');
        });
    });

    describe('Integration Tests - Multiple Validations', () => {
        it('should pass all validations with complete valid data', async () => {
            const req = {
                params: {
                    id: '507f1f77bcf86cd799439011',
                },
                body: {
                    status: 'approved',
                    adminComment: 'Valid comment',
                },
                query: {
                    status: 'pending',
                },
            };

            const allValidations = [
                ...sellerRequestIdParamValidation(),
                ...updateSellerRequestStatusValidation(),
                ...filterSellerRequestsValidation(),
            ];

            for (const validation of allValidations) {
                await validation.run(req);
            }

            const errors = validationResult(req);

            expect(errors.isEmpty()).toBe(true);
        });

        it('should accumulate multiple validation errors', async () => {
            const req = {
                params: {
                    id: 'invalid-id',
                },
                body: {
                    status: 'invalid-status',
                    adminComment: 123,
                },
                query: {
                    status: 'invalid-query-status',
                },
            };

            const allValidations = [
                ...sellerRequestIdParamValidation(),
                ...updateSellerRequestStatusValidation(),
                ...filterSellerRequestsValidation(),
            ];

            for (const validation of allValidations) {
                await validation.run(req);
            }

            const errors = validationResult(req);

            expect(errors.isEmpty()).toBe(false);
            expect(errors.array().length).toBeGreaterThan(1);

            const errorMessages = errors.array().map((error) => error.msg);
            expect(errorMessages).toContain('Request ID must be a valid MongoDB ID');
            expect(errorMessages).toContain('Status must be either "approved" or "rejected"');
            expect(errorMessages).toContain('Admin comment must be a string');
            expect(errorMessages).toContain('Status must be one of: pending, approved, rejected');
        });
    });
});
