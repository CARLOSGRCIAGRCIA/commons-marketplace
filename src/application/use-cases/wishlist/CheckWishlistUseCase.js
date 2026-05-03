import { log } from '../../../infrastructure/logger/logger.js';
import { ok, err } from '../../../core/either/Result.js';
import { ValidationError, InfrastructureError } from '../../../core/errors/index.js';

/**
 * Use case for checking if a product is in a user's wishlist.
 * @param {object} wishlistRepository - The repository for wishlist data.
 * @returns {Function} A function to execute the use case.
 */
export const checkWishlistUseCase = (wishlistRepository) => async (userId, productId) => {
    try {
        log.debug('Checking wishlist', { userId, productId });

        if (!productId) {
            return err(new ValidationError('Product ID is required'));
        }

        const isInWishlist = await wishlistRepository.hasProduct(userId, productId);

        return ok({ isInWishlist });
    } catch (error) {
        log.error('Error in checkWishlistUseCase', {
            userId,
            productId,
            error: error.message,
            stack: error.stack,
        });
        return err(new InfrastructureError('Failed to check wishlist', error));
    }
};
