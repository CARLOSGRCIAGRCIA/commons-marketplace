/**
 * Creates a ForbiddenException error object.
 * It sets the error name to 'ForbiddenException' and the status code to 403.
 * This is used to handle forbidden access errors in the application, such as insufficient permissions.
 * @param {string} [message] - The error message.
 * @returns {Error} - The custom error object.
 */
export const forbiddenException = (message = 'Forbidden') => {
    const err = new Error(message);
    err.name = 'ForbiddenException';
    err.statusCode = 403;
    return err;
};
