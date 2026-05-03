/**
 * Custom error classes for domain-driven error handling.
 * @module errors
 */

/** Base error class for domain-level failures. */
export class DomainError extends Error {
    /**
     * Creates a domain error.
     * @param {string} message - Error message.
     * @param {string} code - Error code identifier.
     * @param {number} statusCode - HTTP status code.
     */
    constructor(message, code = 'DOMAIN_ERROR', statusCode = 400) {
        super(message);
        this.name = 'DomainError';
        this.code = code;
        this.statusCode = statusCode;
    }
}

/** Error for resources that were not found. */
export class NotFoundError extends DomainError {
    /**
     * Creates a not found error.
     * @param {string} message - Error message.
     */
    constructor(message) {
        super(message, 'NOT_FOUND', 404);
        this.name = 'NotFoundError';
    }
}

/** Error for invalid input or validation failures. */
export class ValidationError extends DomainError {
    /**
     * Creates a validation error.
     * @param {string} message - Error message.
     */
    constructor(message) {
        super(message, 'VALIDATION_ERROR', 422);
        this.name = 'ValidationError';
    }
}

/** Error for unauthorized access attempts. */
export class UnauthorizedError extends DomainError {
    /**
     * Creates an unauthorized error.
     * @param {string} message - Error message.
     */
    constructor(message) {
        super(message, 'UNAUTHORIZED', 403);
        this.name = 'UnauthorizedError';
    }
}

/** Error for conflicting state or duplicate resources. */
export class ConflictError extends DomainError {
    /**
     * Creates a conflict error.
     * @param {string} message - Error message.
     */
    constructor(message) {
        super(message, 'CONFLICT', 409);
        this.name = 'ConflictError';
    }
}

/** Error for infrastructure or external service failures. */
export class InfrastructureError extends Error {
    /**
     * Creates an infrastructure error.
     * @param {string} message - Error message.
     * @param {Error|null} originalError - The original error if any.
     */
    constructor(message, originalError = null) {
        super(message);
        this.name = 'InfrastructureError';
        this.code = 'INFRASTRUCTURE_ERROR';
        this.statusCode = 500;
        this.originalError = originalError;
    }
}
