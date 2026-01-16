import Ably from 'ably';

let ablyInstance = null;

/**
 * Get Ably client instance
 * @description Creates or returns existing Ably client
 * @returns {object} Ably client instance
 */
export const getAblyClient = () => {
    if (!ablyInstance) {
        const apiKey = process.env.ABLY_API_KEY;
        if (!apiKey) {
            throw new Error('ABLY_API_KEY is not defined');
        }
        ablyInstance = new Ably.Rest({ key: apiKey });
    }
    return ablyInstance;
};
