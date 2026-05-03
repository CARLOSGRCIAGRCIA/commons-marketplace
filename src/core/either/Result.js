/**
 * Either/Result monad implementation for functional error handling.
 * Use `Ok` for successful results and `Err` for error results.
 * Factory functions: `ok()`, `err()`, `okAsync()`, `errAsync()`.
 * @module Result
 */

/**
 * Represents a successful result containing a value.
 * @class
 */
export class Ok {
    /**
     * Creates an Ok result.
     * @param {*} value - The successful value.
     */
    constructor(value) {
        this.value = value;
        this.isOk = true;
        this.isErr = false;
    }

    /**
     * Transforms the value if Ok.
     * @param {Function} fn - Transform function.
     * @returns {Ok} New Ok with transformed value.
     */
    map(fn) {
        return new Ok(fn(this.value));
    }

    /**
     * Does nothing for Ok results.
     * @param {Function} _fn - Ignored.
     * @returns {Ok} This instance.
     */
    mapErr(_fn) {
        return this;
    }

    /**
     * Chains a function that returns a Result.
     * @param {Function} fn - Function returning Result.
     * @returns {Result} Result from fn.
     */
    flatMap(fn) {
        return fn(this.value);
    }

    /**
     * Returns the value or calls defaultFn for Err.
     * @param {Function} _defaultFn - Ignored for Ok.
     * @returns {*} The contained value.
     */
    getOrElse(_defaultFn) {
        return this.value;
    }

    /**
     * Returns the contained value.
     * @returns {*} The contained value.
     */
    getOrThrow() {
        return this.value;
    }

    /**
     * Unwraps and returns the value.
     * @returns {*} The contained value.
     */
    unwrap() {
        return this.value;
    }

    /**
     * Pattern matches on the result.
     * @param {object} handlers - Object with ok and err handlers.
     * @param {Function} handlers.ok - Handler for Ok.
     * @param {Function} _err - Ignored handler for Err.
     * @returns {*} Result of ok handler.
     */
    match({ ok, _err }) {
        return ok(this.value);
    }
}

/**
 * Represents a failed result containing an error.
 * @class
 */
export class Err {
    /**
     * Creates an Err result.
     * @param {Error} error - The error value.
     */
    constructor(error) {
        this.error = error;
        this.isOk = false;
        this.isErr = true;
    }

    /**
     * Does nothing for Err results.
     * @param {Function} _fn - Ignored.
     * @returns {Err} This instance.
     */
    map(_fn) {
        return this;
    }

    /**
     * Transforms the error if Err.
     * @param {Function} fn - Transform function.
     * @returns {Err} New Err with transformed error.
     */
    mapErr(fn) {
        return new Err(fn(this.error));
    }

    /**
     * Does nothing for Err results.
     * @param {Function} _fn - Ignored.
     * @returns {Err} This instance.
     */
    flatMap(_fn) {
        return this;
    }

    /**
     * Returns the result of defaultFn for the error.
     * @param {Function} defaultFn - Fallback function.
     * @returns {*} Result of defaultFn.
     */
    getOrElse(defaultFn) {
        return defaultFn(this.error);
    }

    /**
     * Throws the contained error.
     * @throws {Error} The contained error.
     */
    getOrThrow() {
        throw this.error;
    }

    /**
     * Throws an error since this is an Err.
     * @throws {Error} Always throws.
     */
    unwrap() {
        throw new Error('Called unwrap() on an Err value');
    }

    /**
     * Pattern matches on the result.
     * @param {object} handlers - Object with ok and err handlers.
     * @param {Function} _ok - Ignored handler for Ok.
     * @param {Function} handlers.err - Handler for Err.
     * @returns {*} Result of err handler.
     */
    match({ _ok, err }) {
        return err(this.error);
    }
}

/**
 * Creates an Ok result.
 * @param {*} value - The successful value.
 * @returns {Ok} An Ok result.
 */
export function ok(value) {
    return new Ok(value);
}

/**
 * Creates an Err result.
 * @param {Error} error - The error value.
 * @returns {Err} An Err result.
 */
export function err(error) {
    return new Err(error);
}

/**
 * Creates a Promise resolving to an Ok result.
 * @param {*} value - The successful value.
 * @returns {Promise<Ok>} Promise resolving to Ok.
 */
export function okAsync(value) {
    return Promise.resolve(new Ok(value));
}

/**
 * Creates a Promise resolving to an Err result.
 * @param {Error} error - The error value.
 * @returns {Promise<Err>} Promise resolving to Err.
 */
export function errAsync(error) {
    return Promise.resolve(new Err(error));
}
