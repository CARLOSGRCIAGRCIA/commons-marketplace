import { log } from '../logger/logger.js';

/**
 * Retry configuration defaults
 */
const DEFAULT_RETRY_OPTS = {
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2,
    maxRetryDelay: 10000,
    transientErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'EHOSTUNREACH'],
};

/**
 * Sleep utility for delays
 * @param {number} ms - Milliseconds
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Execute function with retry logic
 * @param {Function} fn - Function to execute
 * @param {object} options - Retry options
 * @returns {Promise<any>} Result of function
 */
export const withRetry = async (fn, options = {}) => {
    const opts = { ...DEFAULT_RETRY_OPTS, ...options };
    let lastError;

    for (let attempt = 1; attempt <= opts.maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            const isTransient = opts.transientErrors.some(
                (code) => error.code === code || error.message?.includes(code),
            );

            if (!isTransient && !opts.retryOn.any((pred) => pred(error))) {
                throw error;
            }

            if (attempt < opts.maxRetries) {
                const delay = Math.min(
                    opts.retryDelay * Math.pow(opts.backoffMultiplier, attempt - 1),
                    opts.maxRetryDelay,
                );

                log.warn('Retrying after error', {
                    attempt,
                    maxRetries: opts.maxRetries,
                    delay,
                    error: error.message,
                });

                await sleep(delay);
            }
        }
    }

    throw lastError;
};

/**
 * Create retryable function
 * @param {Function} fn - Function to make retryable
 * @param {object} options - Retry options
 * @returns {Function} Retryable function
 */
export const retryable = (fn, options = {}) => {
    return async (...args) => withRetry(() => fn(...args), options);
};

/**
 * Retry options builder.
 * @class
 */
export class RetryOptions {
    /**
     * Creates a new RetryOptions instance.
     */
    constructor() {
        this.maxRetries = DEFAULT_RETRY_OPTS.maxRetries;
        this.retryDelay = DEFAULT_RETRY_OPTS.retryDelay;
        this.backoffMultiplier = DEFAULT_RETRY_OPTS.backoffMultiplier;
        this.maxRetryDelay = DEFAULT_RETRY_OPTS.maxRetryDelay;
        this.retryOn = {
            any: () => true,
        };
    }

    /**
     * Set max retries.
     * @param {number} maxRetries - Max retries
     * @returns {RetryOptions} RetryOptions instance
     */
    withMaxRetries(maxRetries) {
        this.maxRetries = maxRetries;
        return this;
    }

    /**
     * Set base retry delay.
     * @param {number} retryDelay - Base delay in ms
     * @returns {RetryOptions} RetryOptions instance
     */
    withRetryDelay(retryDelay) {
        this.retryDelay = retryDelay;
        return this;
    }

    /**
     * Set exponential backoff.
     * @param {number} multiplier - Backoff multiplier
     * @returns {RetryOptions} RetryOptions instance
     */
    withBackoff(multiplier) {
        this.backoffMultiplier = multiplier;
        return this;
    }

    /**
     * Custom retry predicate.
     * @param {Function} predicate - Retry predicate
     * @returns {RetryOptions} RetryOptions instance
     */
    retryWhen(predicate) {
        this.retryOn.any = predicate;
        return this;
    }

    /**
     * Build retry options.
     * @returns {object} Built options
     */
    build() {
        return {
            maxRetries: this.maxRetries,
            retryDelay: this.retryDelay,
            backoffMultiplier: this.backoffMultiplier,
            maxRetryDelay: this.maxRetryDelay,
            retryOn: this.retryOn,
        };
    }
}

export default { withRetry, retryable, RetryOptions };