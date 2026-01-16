/**
 * SellerRequest Entity
 * Represents a request from a user to become a seller
 * @typedef {object} SellerRequest
 * @property {string} id - Unique identifier
 * @property {string} userId - Supabase user ID
 * @property {string} status - Request status (pending, approved, rejected)
 * @property {string} message - User's message explaining why they want to be a seller
 * @property {string} adminComment - Admin's comment on the request
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * Creates a SellerRequest entity
 * @param {object} data - Seller request data
 * @returns {SellerRequest} Seller request entity
 */
export const createSellerRequestEntity = (data) => ({
    id: data.id || data._id?.toString(),
    userId: data.userId,
    status: data.status || 'pending',
    message: data.message || '',
    adminComment: data.adminComment || '',
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
});
