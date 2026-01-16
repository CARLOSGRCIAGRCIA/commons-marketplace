import { notFoundException } from '../../../presentation/exceptions/notFoundException.js';

/**
 * Deletes a seller request use case
 * @param {object} sellerRequestRepository - Seller request repository
 * @returns {Function} Use case function
 */
export const deleteSellerRequestUseCase = (sellerRequestRepository) => {
    return async (requestId) => {
        const request = await sellerRequestRepository.findById(requestId);

        if (!request) {
            throw notFoundException('Seller request not found');
        }

        const deletedRequest = await sellerRequestRepository.deleteById(requestId);
        return deletedRequest;
    };
};
