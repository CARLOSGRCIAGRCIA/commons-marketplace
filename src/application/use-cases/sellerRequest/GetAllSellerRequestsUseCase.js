/**
 * Gets all seller requests use case
 * @param {object} sellerRequestRepository - Seller request repository
 * @returns {Function} Use case function
 */
export const getAllSellerRequestsUseCase = (sellerRequestRepository) => {
    return async (filter = {}, options = {}) => {
        return sellerRequestRepository.findAll(filter, options);
    };
};
