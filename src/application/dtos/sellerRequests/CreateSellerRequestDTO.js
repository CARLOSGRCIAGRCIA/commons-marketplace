/**
 * DTO for creating a seller request
 * @param {object} data - Request data
 * @returns {object} Formatted DTO
 */
export const createSellerRequestDTO = (data) => ({
    message: data.message || '',
});
