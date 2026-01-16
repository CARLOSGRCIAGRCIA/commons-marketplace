/**
 * Creates a custom error object for bad request exceptions.
 * It sets the error name to 'BadRequestException' and the status code to 400.
 * This is used to handle client-side errors that occur during the execution of the application.
 * @param {string} [message] - The error message.
 * @returns {Error} - The custom error object.
 */
export const badRequestException = (message = 'Bad Request') => {
    const err = new Error(message);
    err.name = 'BadRequestException';
    err.statusCode = 400;
    return err;
};
