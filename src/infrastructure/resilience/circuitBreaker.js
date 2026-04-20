import { log } from '../logger/logger.js';

/**
 * Circuit breaker states
 */
const CircuitState = {
    CLOSED: 'closed',
    OPEN: 'open',
    HALF_OPEN: 'half_open',
};

/**
 * Simple circuit breaker implementation
 */
export class CircuitBreaker {
    /**
     * Create a circuit breaker
     * @param {string} name - Circuit name
     * @param {object} options - Options
     */
    constructor(name, options = {}) {
        this.name = name;
        this.failureThreshold = options.failureThreshold || 5;
        this.successThreshold = options.successThreshold || 2;
        this.timeout = options.timeout || 30000;
        this.timeout = options.timeout || 30000;
        this.monitored = options.monitored || [];

        this.state = CircuitState.CLOSED;
        this.failures = 0;
        this.successes = 0;
        this.lastFailureTime = null;
        this.nextAttempt = null;
    }

    /**
     * Execute function through circuit breaker
     * @param {Function} fn - Function to execute
     * @param {Function} fallback - Fallback function
     * @returns {Promise<any>} Result
     */
    async execute(fn, fallback) {
        if (this.state === CircuitState.OPEN) {
            if (Date.now() >= this.nextAttempt) {
                this.state = CircuitState.HALF_OPEN;
                this.successes = 0;
                log.info(`Circuit ${this.name} transitioning to HALF_OPEN`);
            } else {
                if (fallback) {
                    return fallback();
                }
                throw new Error(`Circuit ${this.name} is OPEN`);
            }
        }

        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure(error);
            if (fallback) {
                return fallback();
            }
            throw error;
        }
    }

    /**
     * Handle success
     */
    onSuccess() {
        this.failures = 0;

        if (this.state === CircuitState.HALF_OPEN) {
            this.successes++;
            if (this.successes >= this.successThreshold) {
                this.state = CircuitState.CLOSED;
                log.info(`Circuit ${this.name} CLOSED after recovery`);
            }
        }
    }

    /**
     * Handle failure
     * @param {Error} error - Error
     */
    onFailure(error) {
        this.failures++;
        this.lastFailureTime = Date.now();

        if (this.state === CircuitState.HALF_OPEN) {
            this.state = CircuitState.OPEN;
            this.nextAttempt = Date.now() + this.timeout;
            log.warn(`Circuit ${this.name} OPEN after failure in HALF_OPEN`);
        } else if (this.failures >= this.failureThreshold) {
            this.state = CircuitState.OPEN;
            this.nextAttempt = Date.now() + this.timeout;
            log.error(`Circuit ${this.name} OPEN after ${this.failures} failures`, {
                error: error.message,
            });
        }
    }

    /**
     * Get circuit status.
     * @returns {object} Status object
     */
    getStatus() {
        return {
            name: this.name,
            state: this.state,
            failures: this.failures,
            successes: this.successes,
            lastFailureTime: this.lastFailureTime,
            nextAttempt: this.nextAttempt,
        };
    }

    /**
     * Reset circuit.
     */
    reset() {
        this.state = CircuitState.CLOSED;
        this.failures = 0;
        this.successes = 0;
        this.lastFailureTime = null;
        this.nextAttempt = null;
    }
}

/**
 * Circuit breaker registry.
 * @class
 */
export class CircuitBreakerRegistry {
    /**
     * Creates a new CircuitBreakerRegistry instance.
     */
    constructor() {
        this.circuits = new Map();
    }

    /**
     * Get or create circuit breaker.
     * @param {string} name - Circuit name
     * @param {object} options - Options
     * @returns {CircuitBreaker} Circuit breaker instance
     */
    getOrCreate(name, options) {
        if (!this.circuits.has(name)) {
            this.circuits.set(name, new CircuitBreaker(name, options));
        }
        return this.circuits.get(name);
    }

    /**
     * Get all circuit statuses.
     * @returns {object[]} Array of circuit statuses
     */
    getAllStatus() {
        return Array.from(this.circuits.values()).map((cb) => cb.getStatus());
    }

    /**
     * Reset all circuits.
     * @returns {void}
     */
    resetAll() {
        this.circuits.forEach((cb) => cb.reset());
    }
}

export const circuitRegistry = new CircuitBreakerRegistry();
export default { CircuitBreaker, CircuitBreakerRegistry, circuitRegistry };
