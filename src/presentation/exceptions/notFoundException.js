/**
 * Creates a custom error object for a "Not Found" exception.
 * It sets the error name to 'NotFoundException' and the status code to 404.
 * This is used to handle cases where a requested resource could not be found.
 * @param {string} [message] - The error message.
 * @returns {Error} - The custom error object.
 */
export const notFoundException = (message = 'Not Found') => {
    const err = new Error(message);
    err.name = 'NotFoundException';
    err.statusCode = 404;
    return err;
};
