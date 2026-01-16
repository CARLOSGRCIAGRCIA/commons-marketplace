/**
 * Creates a standardized error object for duplicated key conflicts (HTTP 409).
 * @function duplicateKeyException
 * @param {string} [message] - Custom error message describing the duplicate key issue.
 * @returns {Error} An `Error` object with a `status` property set to `409` and name `DuplicateKeyException`.
 * @description
 * This function generates a reusable error instance representing a conflict due to duplicate keys
 * (for example, inserting a record with an existing unique field in a database).
 *
 * The returned error object includes:
 * - `name`: `"DuplicateKeyException"`
 * - `status`: `409` (HTTP Conflict)
 * - `message`: The provided or default error message.
 * @example
 * throw duplicateKeyException('User with this email already exists');
 * @example
 * const err = duplicateKeyException();
 * console.error(err.name, err.status, err.message);
 */
export const duplicateKeyException = (message = 'Duplicated key error') => {
    const error = new Error(message);
    error.status = 409;
    error.name = 'DuplicateKeyException';
    return error;
};
