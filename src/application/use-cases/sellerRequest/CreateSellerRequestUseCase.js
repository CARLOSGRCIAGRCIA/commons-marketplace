import { badRequestException } from '../../../presentation/exceptions/badRequestException.js';

/**
 * Creates a new seller request use case
 * @param {object} sellerRequestRepository - Seller request repository
 * @returns {Function} Use case function
 */
export const createSellerRequestUseCase = (sellerRequestRepository) => {
    return async (userId, requestData) => {
        const existingRequest = await sellerRequestRepository.findByUserId(userId);

        if (existingRequest) {
            if (existingRequest.status === 'approved') {
                throw badRequestException('User is already a seller');
            }
            if (existingRequest.status === 'pending') {
                throw badRequestException('User already has a pending request');
            }
        }

        const newRequest = await sellerRequestRepository.create({
            userId,
            message: requestData.message || '',
        });

        return newRequest;
    };
};
