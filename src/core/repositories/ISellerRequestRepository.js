/**
 * Creates a new seller request
 * @param {object} requestData - Seller request data
 * @returns {Promise<object>} Created seller request
 */

export const create = (requestData) => {
    throw new Error('create() must be implemented');
};

/**
 * Finds a seller request by ID
 * @param {string} requestId - Seller request ID
 * @returns {Promise<object | null>} Seller request or null
 */

export const findById = (requestId) => {
    throw new Error('findById() must be implemented');
};

/**
 * Finds all seller requests with optional filter
 * @param {object} filter - Query filter
 * @param {object} options - Query options
 * @returns {Promise<Array>} Array of seller requests
 */

export const findAll = (filter, options) => {
    throw new Error('findAll() must be implemented');
};

/**
 * Finds a seller request by user ID
 * @param {string} userId - User ID
 * @returns {Promise<object | null>} Seller request or null
 */

export const findByUserId = (userId) => {
    throw new Error('findByUserId() must be implemented');
};

/**
 * Updates a seller request by ID
 * @param {string} requestId - Seller request ID
 * @param {object} updateData - Data to update
 * @returns {Promise<object | null>} Updated seller request or null
 */

export const updateById = (requestId, updateData) => {
    throw new Error('updateById() must be implemented');
};

/**
 * Deletes a seller request by ID
 * @param {string} requestId - Seller request ID
 * @returns {Promise<object>} Deleted seller request
 */

export const deleteById = (requestId) => {
    throw new Error('deleteById() must be implemented');
};
