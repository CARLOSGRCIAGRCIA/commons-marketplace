/**
 * DTO for seller request response
 * @param {object} sellerRequest - Seller request entity
 * @returns {object} Formatted response
 */
export const sellerRequestResponseDTO = (sellerRequest) => ({
    id: sellerRequest.id || sellerRequest._id?.toString(),
    userId: sellerRequest.userId,
    status: sellerRequest.status,
    message: sellerRequest.message,
    adminComment: sellerRequest.adminComment,
    createdAt: sellerRequest.createdAt,
    updatedAt: sellerRequest.updatedAt,
});

/**
 * Maps multiple seller requests to response DTOs
 * @param {Array} sellerRequests - Array of seller requests
 * @returns {Array} Array of formatted responses
 */
export const sellerRequestListResponseDTO = (sellerRequests) =>
    sellerRequests.map(sellerRequestResponseDTO);
