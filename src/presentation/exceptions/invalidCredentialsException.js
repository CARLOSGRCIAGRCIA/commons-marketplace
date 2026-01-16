/**
 * Invalid Credentials Exception
 * @param {string} message - Error message
 * @returns {Error} Error object with status 401
 */
export const invalidCredentialsException = (message = 'Invalid login credentials') => {
    const error = new Error(message);
    error.status = 401;
    error.name = 'InvalidCredentialsException';
    return error;
};
