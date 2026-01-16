import { notFoundException } from '../../../presentation/exceptions/notFoundException.js';

/**
 * Gets a seller request by ID use case
 * @param {object} sellerRequestRepository - Seller request repository
 * @returns {Function} Use case function
 */
export const getSellerRequestByIdUseCase = (sellerRequestRepository) => {
    return async (requestId) => {
        const request = await sellerRequestRepository.findById(requestId);

        if (!request) {
            throw notFoundException('Seller request not found');
        }

        return request;
    };
};
