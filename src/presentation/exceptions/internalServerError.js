/**
 * Creates a custom error object for internal server errors.
 * It sets the error name to 'InternalServerError' and the status code to 500.
 * This is used to handle unexpected errors that occur during the execution of the application.
 * @param {string} [message] - The error message.
 * @returns {Error} - The custom error object.
 */
export const internalServerError = (message = 'Internal Server Error') => {
    const err = new Error(message);
    err.name = 'InternalServerError';
    err.statusCode = 500;
    return err;
};
