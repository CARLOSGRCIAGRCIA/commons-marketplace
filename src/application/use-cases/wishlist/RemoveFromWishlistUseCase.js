import { log } from '../../../infrastructure/logger/logger.js';
import { ok, err } from '../../../core/either/Result.js';
import { ValidationError, InfrastructureError } from '../../../core/errors/index.js';

/**
 * Use case for removing a product from a user's wishlist.
 * @param {object} wishlistRepository - The repository for wishlist data.
 * @returns {Function} A function to execute the use case.
 */
export const removeFromWishlistUseCase = (wishlistRepository) => async (userId, productId) => {
    try {
        log.info('Removing product from wishlist', { userId, productId });

        if (!productId) {
            return err(new ValidationError('Product ID is required'));
        }

        const wishlist = await wishlistRepository.removeItem(userId, productId);

        if (!wishlist) {
            return err(new InfrastructureError('Wishlist not found'));
        }

        log.info('Product removed from wishlist', { userId, productId });

        return ok(wishlist);
    } catch (error) {
        log.error('Error in removeFromWishlistUseCase', {
            userId,
            productId,
            error: error.message,
            stack: error.stack,
        });
        return err(new InfrastructureError('Failed to remove product from wishlist', error));
    }
};
