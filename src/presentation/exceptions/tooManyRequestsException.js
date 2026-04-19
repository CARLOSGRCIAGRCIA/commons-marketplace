/**
 * Creates a custom error object for rate limit exceeded (429 Too Many Requests).
 * It sets the error name to 'TooManyRequestsException' and the status code to 429.
 * This is used when a client exceeds the allowed number of requests.
 * @param {string} [message] - The error message.
 * @returns {Error} - The custom error object.
 */
export const tooManyRequestsException = (message = 'Too Many Requests') => {
    const err = new Error(message);
    err.name = 'TooManyRequestsException';
    err.statusCode = 429;
    return err;
};
