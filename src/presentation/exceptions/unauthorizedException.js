/**
 * Creates an UnauthorizedException error object.
 * It sets the error name to 'UnauthorizedException' and the status code to 401.
 * This is used to handle unauthorized access errors in the application.
 * @param {string} [message] - The error message.
 * @returns {Error} - The custom error object.
 */
export const unauthorizedException = (message = 'Unauthorized') => {
    const err = new Error(message);
    err.name = 'UnauthorizedException';
    err.statusCode = 401;
    return err;
};
