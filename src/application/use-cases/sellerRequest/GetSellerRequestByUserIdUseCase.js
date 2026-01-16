/**
 * Gets seller request by user ID use case
 * @param {object} sellerRequestRepository - Seller request repository
 * @returns {Function} Use case function
 */
export const getSellerRequestByUserIdUseCase = (sellerRequestRepository) => {
    return async (userId) => {
        const request = await sellerRequestRepository.findByUserId(userId);

        if (!request) {
            return {
                status: 'not_found',
                message: 'No seller request found for this user',
            };
        }

        return request;
    };
};
